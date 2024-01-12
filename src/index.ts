import { program } from 'commander';

import {run, status, flush} from './commands';

const main = async () => {
    
    let runCmd = program.command('run');
    runCmd
        .summary('Run indexing')
        .action(run);

    let statusCmd = program.command('status');
    statusCmd
        .summary('Show current url we stopped at')
        .action(status);

    let flushCmd = program.command('flush');
    flushCmd
        .summary('Clear current processing to start over')
        .action(flush);

    program.parse(process.argv);
}

main();
