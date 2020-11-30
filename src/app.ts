#!/usr/bin/env node
import minimist from 'minimist';
import child_process from 'child_process';
import help from './commands/help';
import project from './commands/project';

const args = minimist(process.argv.slice(2), {
    alias: {
        h: 'help',
        c: 'create-project',
    }
});
//se hace limpieza de la consola antes de la ejecución de un comando de mussa
child_process.spawn(process.platform === 'win32' ? 'cls' : 'clear', { shell: true });

/**
 * Ejecución de comandos mussa 🐶
 */
if (args['help']) {
    if (typeof args['help'] !== 'boolean') {
        console.error('El comando no necesita argumentos adicionales');
        process.exit(1);
    }
    //se invoca al comando help.echo para mostrar el mensaje de ayuda
    help.echo();
}

if (args['create-project']) {
    if (typeof args['create-project'] !== 'string') {
        console.error('El comando requiere el nombre del proyecto a crear');
        process.exit(1)
    }
    //se invoca al comando project.create crear un nuevo proyecto de mussa
    project.create(args['create-project']);
}