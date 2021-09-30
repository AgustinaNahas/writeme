export function replaceComplexCommand(texto, command, reemplazo) {
    const array = texto.split(command)

    for (var i = 0; i < array.length; i++) {
        if(i % 2 === 0 && i < array.length - 1) { // index is even
            array[i] += "<" + reemplazo + ">";
        } else if (i % 2 !== 0) array[i] += "</" + reemplazo + ">";
    }

    const resultado = array.join("")

    return resultado;
}

export function replaceSimpleCommand(texto, command, reemplazo) {
    const array = texto.split(command)

    for (var i = 0; i < array.length; i++) {
        if(i < array.length - 1) array[i] += reemplazo;
    }

    const resultado = array.join("")

    return resultado;
}

