import fs from 'fs';
import { EOL } from "os";
import { join } from 'path';
import * as csv from 'fast-csv';


/**
 * Storage class intended to work with files for multiple projects.
 * Constructor will accept path to the list of files that follow the structure:
 *     <projectname>_sa.json
 *     <projectname>_urllist.csv
 *     <projectname>_metadata.json (optional and will be created if not exists)
 */
export class Storage {
    // path to the folder that stores all files
    path: string;
    
    constructor (path: string) {
        this.path = path;
    }

    /**
     * Get list of projects, parse list of urls, load service account and metadata
     */
    listProjects = async () => {
        let files = fs.readdirSync(this.path);

        let projects = files.filter((fname) => {
            return fs.statSync(join(this.path, fname)).isDirectory();
        });

        return projects;
    }

    loadData = async (project: string): Promise<any> => {
        
        // create base structure for response
        let res = {
            sa: await this.loadDataSA(project),
            urls: await this.loadDataUrls(project, 'urls'),
            urls_processed: await this.loadDataUrls(project, 'urls_processed')
        };

        return res;
    }

    /**
     * Load Service Account Certificate 
     *  
     * @param ppath - path to project folder
     * @returns object
     */
    private loadDataSA = async (project: string): Promise<any> => {
        let path = this.fpath(project, 'sa.json');
        try {
            return JSON.parse(fs.readFileSync(path, 'utf-8'));
        } catch {
            let msg = 'Error occures loading service account configuration';
            msg += `${EOL}Either file doesn't exists or json format is incorrect ${path}`;
            throw Error(msg);
        }
    }

    /**
     * Load list of urls we need to process 
     *  
     * @param ppath - path to project folder
     * @returns list
     */
    private loadDataUrls = async (project: string, fname: string): Promise<any> => {
        let path = this.fpath(project, `${fname}.csv`);
    
        if (!fs.existsSync(path)) {
            return [];
        }

        let urls = await loadCSV(path, {headers: true});
     
        return urls.map((item) => item.URL);
    }

    /**
     * Save metadata for the project in order to save last position we processed
     * 
     * @param project name of the project we are processing
     */
    saveUrlsProcessed = async (project: string, urls: any) => {
        let path = this.fpath(project, 'urls_processed.csv');

        // add header
        fs.writeFileSync(path, `URL${EOL}`);

        for (const url of urls) {
            fs.appendFileSync(path, `${url}${EOL}`);
        }
    }

    /**
     * Removes urls processed file for project as such, cleans the progress.
     * 
     * @param project name of the project we are processing
     */
    flushUrlsProcessed = async (project: string) => {
        let path = this.fpath(project, 'urls_processed.csv');
                
        if (!fs.existsSync(path)) {
            return [];
        }

        fs.unlinkSync(path);
    }

    /**
     * Compose file path
     * 
     * @param project name of the project we are processing
     * @param fname name of the file
     */

    fpath = (project: string, fname: string): string => {
        let ppath: string = join(this.path, project);

        return join(ppath, fname);
    }
}

let loadCSV = async (path: string, options: any): Promise<{ URL:string }[]> => {

    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(path)
            .pipe(csv.parse(options))
            .on('error', error => {
                console.error(error);
                return reject(error);
            })
            .on('data', row => {
                results.push(row);
            })
            .on('end', (rowCount: number) => {
                resolve(results);
            })

    });
}
