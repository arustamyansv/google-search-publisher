import { config } from '../config';
import { Storage } from '../helpers/storage';

/**
 * Method starts over the processing for all projects
 *
 */
export const flush = async () => {
    console.log('Running flush...');

    let storage = new Storage(config.storagePath);

    let projects = await storage.listProjects();

    for (const project of projects) {
        let data = await storage.loadData(project);
        
        // save empty file
        await storage.flushUrlsProcessed(project);

        console.log(`    Project ${project} flushed.`);
    }
}
