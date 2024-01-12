import { config } from '../config';
import { Storage } from '../helpers/storage';

/**
 * Method returns status of the projects. I.E. What url we stopped during indexing for each project.
 */
export const status = async () => {
    console.log('Running status...');

    let storage = new Storage(config.storagePath);

    let projects = await storage.listProjects();

    for (const project of projects) {
        let data = await storage.loadData(project);
        
        let percent:number = Number((data.urls_processed.length / data.urls.length) * 100);

        console.log(`    Project ${project}. Processed ${percent.toFixed(2)}%`);
    }
}
