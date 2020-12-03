#!/usr/bin/env node
import minimist from 'minimist';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import help from './commands/help';
import project from './commands/project';
import scripts from './commands/scripts';

const args = minimist(process.argv.slice(2), {
    alias: {
        h: 'help',
        c: 'create-project',
        s: 'script'
    }
});
/**
 * Ejecución de comandos mussa 🐶
 */
if (args.help) {
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
        process.exit(1);
    }
    //se invoca al comando project.create crear un nuevo proyecto de mussa
    project.create(args['create-project']);
}

if (args.script) {
    if (typeof args.script !== 'boolean') {
        console.error('El comando no necesita argumentos adicionales');
        process.exit(1);
    }
    fs.access(path.join(process.cwd(), 'manifest.xml'), fs.constants.F_OK, (err) => {
        if (err) {
            console.error('El comando debe ser ejecutado a nivel del manifest.xml')
            process.exit(1);
        }
        //se invoca al comando script.create para mostrar el mensaje de ayuda
        scripts.create();
    })
}