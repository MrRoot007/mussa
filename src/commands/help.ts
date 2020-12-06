const help = {
    echo: (): void => {}
}
help.echo = () => {
    const message = `
    mussa es una aplicación cli para manejar proyectos de netsuite (suiteapps y appcustomization), siendo una capa superior del sdfcli oficial de netsuite, permite realizar acciones
y procesos que no están incluidos en el sdfcli o simplemente enlanzado comandos dentro de un mismo flujo.

* Lista de comandos disponibles:
    > mussa [-c] --create-project <nombre proyecto>     inicializa un nuevo proyecto SDF vacío
    > mussa [-a] --access                               solicitud de acceso a Netsuite
    > mussa [-a] --token                                autenticación por token de mussa a Netsuite
    > mussa [-s] --script                               crear nuevo script [userevent, clientscript, map/reduce, scheduled, suitelet, restlet]
    > mussa [-u] --upload <ruta del archivo>            cargar un archivo al FileCabinet de Netusite 
    > mussa [-d] --deploy                               despliegue de un proyecto SDF a la base de Nesuite configurada
`
    process.stdout.write(message);
    process.exit(0);
}

export default help;