
import axios, { AxiosRequestConfig } from 'axios';
import { google } from 'googleapis';
import { Storage } from '../helpers/storage';
import { config } from '../config';

const GOOGLE_BATCH_LIMIT = 100;

/**
 * Method runs main indexing processing.
 *
 */
export const run = async () => {
    console.log('Running indexing...');

    let storage = new Storage(config.storagePath);

    let projects = await storage.listProjects();

    for (const project of projects) {
        console.log(`Processing project ${project}...`);

        let data = await storage.loadData(project);
        let processedUrls = await processProject(project, data);
        
        // save current progress
        let urls_processed = data.urls_processed;
        urls_processed = urls_processed.concat(processedUrls);
        await storage.saveUrlsProcessed(project, urls_processed);

        console.log('Done!');
    }
}

const processProject = async (name: string, data: any): Promise<string[]> => {
    
    const credentials = await getCredentials(data.sa);

    // filter out urls we didn't process yet
    let urls = await pickActualUrls(data.urls, data.urls_processed);

    // split it into batches cause google batch api allows up to 100 entities at once
    for (let batch of await batchUrls([...urls])) {
        let boundary = '--batchboundary';

        let config: AxiosRequestConfig = {
            headers: {
                'Content-Type': `multipart/mixed; boundary=${boundary}`,
                'Authorization': `Bearer ${credentials.access_token}` 
            }
        };
        
        let multipart = await composeMultipart(batch, boundary);

        let res = await axios.post(
            'https://indexing.googleapis.com/batch', 
            multipart,
            config
        );

        console.log(`    Batch processed. Length ${batch.length}. Status Request: ${res.statusText}`);
    }

    return urls;
}

/**
 * Returns next chunk of work for this cycle
 * @param urls list of all urls we need to go through
 * @param processedUrls list of urls we processed already
 * @returns list
 */
const pickActualUrls = async (urls: string[], processedUrls: string[]): Promise<string[]> => {
    let filtered = urls.filter((url) => !processedUrls.includes(url));
    return filtered.slice(0, config.dailyAPILimit);
}

/**
 * Split urls allowed for the day into several smaller chunks allowed by batch api
 */
const batchUrls = async (urls: string[]): Promise<string[][]> => {
    let batches: string[][] = [];
    let batch: string[] = [];

    while (urls.length) {
        let url = urls.shift();
        batch.push(url);

        if (batch.length === GOOGLE_BATCH_LIMIT) {
            batches.push(batch); 
            batch = [];
            continue;
        }
    }

    if (batch.length) {
        batches.push(batch);
    }

    return batches;
}

/**
 * Return credentials to make requests to google search console
 * 
 * @param sa service account certificate
 * @returns object
 */
const getCredentials = async (sa: any) => {
    const jwtClient = new google.auth.JWT(
        sa.client_email,
        null,
        sa.private_key,
        ['https://www.googleapis.com/auth/indexing'],
        null
    );

    return await jwtClient.authorize();
}

const composeMultipart = async (urls: string[], boundary: string): Promise<string> => { 
    const items = urls.map(url => {
        let data = JSON.stringify({ 
            url: url,
            type: 'URL_UPDATED'
        });

        let request = 'Content-Type: application/http\n'
            + 'Content-Transfer-Encoding: binary\n'
            + "Content-ID: ''\n"
            + '\n'
            + 'POST /v3/urlNotifications:publish HTTP/1.1\n'
            + 'Content-Type: application/json\n'
            + 'accept: application/json\n'
            + `content-length: ${data.length}\n`
            + '\n'
            + data;
            
        return request;
    });

    let boundaryDelimiter = `\n--${boundary}\n`;
    let res = items.join(boundaryDelimiter);
    res = `${boundaryDelimiter}${res}${boundaryDelimiter}`;

    return res;
}
