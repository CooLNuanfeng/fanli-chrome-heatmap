(function(){
    var oBtn = document.getElementById('btn');
    var status = true; //开启

    oBtn.onclick = function(){
        if(status){
            oBtn.innerHTML = '开启';
            oBtn.classList.add('btn-green');
            oBtn.classList.remove('btn-red');
        }else{
            oBtn.innerHTML = '关闭';
            oBtn.classList.add('btn-red');
            oBtn.classList.remove('btn-green');
        }
        status = !status;
    };

    console.log(chrome);

})();
