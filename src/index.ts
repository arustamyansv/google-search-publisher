import { program } from 'commander';

import {run, status, flush} from './commands';

const main = async () => {
    
    let runCmd = program.command('run');
    runCmd
        .summary('Run indexing')
        .action(run);

    let statusCmd = program.command('status');
    statusCmd
        .summary('Show current progress')
        .action(status);

    let flushCmd = program.command('flush');
    flushCmd
        .summary('Clear current progress so all urls will be processed all over')
        .action(flush);

    program.parse(process.argv);
}

main();
