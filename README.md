# mussa

mussa es una aplicación cli para manejar proyectos de netsuite (suiteapps y appcustomization), siendo una capa superior del sdfcli oficial de netsuite, permite realizar acciones
y procesos que no están incluidos en el sdfcli o simplemente elanzado comandos dentro de un mismo flujo.

la intención principal de mussa es poder realizar la mayoría de las acciones de control de nuestros proyectos desde terminal usando cualquier IDE.

## Requerimientos

    - Java JDK 11
    - Node 
    - npm

## Instalación

> npm install -g mussa

## Guía de uso

mussa tiene una serie de comandos disponibles para llevar el control del proyecto sdf, cada unos de estos comandos esta disponible desde mussa --help.

- Lista de comandos disponibles:

    - ```mussa [-c] --create-project <nombre proyecto>```     inicializa un nuevo proyecto SDF vacío
    - ```mussa [-a] --access```                               solicitud de acceso a Netsuite
    - ```mussa [-a] --token ```                               autenticación por token de mussa a Netsuite
    - ```mussa [-s] --script```                               crear nuevo script [userevent, clientscript, map/reduce, scheduled, suitelet, restlet]
    - ```mussa [-u] --upload <ruta del archivo>```            cargar un archivo al FileCabinet de Netusite 
    - ```mussa [-d] --deploy```                               despliegue de un proyecto SDF a la base de Nesuite configurada