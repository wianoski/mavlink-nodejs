$(document).ready(function(){
    const socket = io.connect();
    socket.on('mavlink', (data) => {
        console.log(data);
    })
})