(function(){

    let alert = document.querySelector('.alert');
    let message = document.getElementById('alert-message').innerHTML;

    if (message.length > 0) {
        alert.style.display = "block";
    }

    alert.addEventListener('click', function(event) {
        alert.style.display = "none";
    });

})();