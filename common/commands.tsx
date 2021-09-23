export function findCommand(texto, command) {
    // const texto = "me contestaste negrita el mensaje de del instructivo para cargar el la vacunación de mi Argentina negrita Contame Qué onda no es lo que vi que estaba negrita lo de casciari lo vi en el gato y la caja negrita pero como vi que como que estaba grabado no sea que lo puedo ver en otro momento porque lo quiero ver y escuchar hoy no tenía auriculares en el trabajo así que se me complicó pero quería escucharlo Dale Contame Cómo anda Ándale y esto que te decía papá que me eché no sabe todavía pero Juan Manuel no viene así que podemos ir si querés lo pasamos a buscar y vamos a lo de Mimi o vienen para acá o como vos quiera no lo paso a buscar y pues le pasó su cara papá que lo que ustedes quieran Dale"
    const array = texto.split(command)

    for (var i = 0; i < array.length; i++) {
        if(i % 2 === 0) { // index is even
            array[i] += "<b>";
        } else if (i % 2 === 0 && i !== array.length-1) array[i] += "</b>";
    }

    const resultado = array.join("")

    return resultado;
}
