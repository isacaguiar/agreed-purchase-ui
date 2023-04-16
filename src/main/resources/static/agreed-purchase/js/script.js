//Funcao adiciona uma nova linha na tabela
let purchase = new Object();
let items = [];
let mapPersonAddFee;

var amountAux;

function isNumber(n){
    return Number(n) === n && n % 1 !== 0;
}

function charge(id) {
    var tempKey;
    var tempValue;
    for (const [key, value] of Object.entries(mapPersonAddFee)) {
      if(key == id) {
        tempKey = key;
        tempValue = value;
        break;
      }
    }
    console.log(tempKey + " - "+tempValue);
    generateCopyPaste(tempValue);
}

function openModalTotal(obj) {

    $("#table-total tr td").remove();
    mapPersonAddFee = obj.mapPersonAddFee;

    $("#itemModalTotal").modal('show');
    var mapTemp = new Map(Object.entries(obj.mapPersonAddFee));
    console.log(":: "+mapTemp);

    for (const [key, value] of Object.entries(obj.mapPersonAddFee)) {
      console.log(`${key}: ${value}`);
      addLineTableTotal(`${key}`,`${value}`);
    }
}

function prepareObject() {
    purchase.itemRequests = items;
    purchase.fee = $('#formControlFee').val();
    purchase.discount = $('#formControlDiscount').val();
    purchase.discountType = $('#formControlDiscountType').val();
}

function generateQR(value) {

    $("#qrcode").text('');

    // Cria o QR code usando a biblioteca QRCode.js
    var qrcode = new QRCode(document.getElementById("qrcode"), {
      text: value,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    // Obtém a imagem do QR code como uma string base64
    var qrImage = document.getElementById("qrcode").getElementsByTagName("img")[0].src;
    $("#itemModalQrCode").modal('show');

    $('#hd-copy-paste').val(value);

}

// Copia o copy pasta do QR code para a área de transferência
function copyContentCopyPaste() {
    var value = $('#hd-copy-paste').val();
    navigator.clipboard.writeText(value).then(function() {
      alert("O Cópia e cola do QrCode foi copiado para a área de transferência!");
    }, function() {
      alert("Não foi possível copiar.");
    });
}

function generateTxid(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function generateCopyPaste(value) {

    var temp = new Object();
    temp.pixKey = $('#formControlPixKey').val();
    temp.description = $('#formControlDescription').val();
    temp.merchantName = $('#formControlReceive').val();
    temp.merchantCity = $('#formControlPixCity').val();
    temp.txid = generateTxid(100, 999);//crypto.randomUUID();
    temp.amount = value;
    var json = JSON.stringify(temp);

    $.ajax({
         url : "http://localhost:8082/charge",
         type : 'post',
         data : json,
         crossDomain: true,
         contentType: "application/json; charset=utf-8",
         dataType: "json"
    })
    .done(function(data){
         var response = JSON.parse(JSON.stringify(data));
         console.log(response);
         console.log("Copy and paste: "+response.copyPaste);
         generateQR(response.copyPaste);
         $("#copy-paste").html(response.copyPaste.substring(0,50)+"...")
    })
    .fail(function(jqXHR, textStatus, msg){
         alert(msg);
    });
}

function calculate() {

    $(".error-msg").remove();
    var erromsg = '<div class="error-msg">Required field</span></div>';

    var formControlPixCity = $('#formControlPixCity');
    var formControlPixKey = $('#formControlPixKey');
    var formControlReceive = $('#formControlReceive');
    var formControlFee = $('#formControlFee');
    var formControlDiscount = $('#formControlDiscount');

    if(!formControlDiscount.val()) {
        formControlDiscount.after(erromsg);
        $(".error-msg span").text("Field required");
        return;
    }

    if(!formControlFee.val()) {
        formControlFee.after(erromsg);
        $(".error-msg span").text("Field required");
        return;
    }

    if(!formControlReceive.val()) {
        formControlReceive.after(erromsg);
        $(".error-msg span").text("Field required");
        return;
    }
    if(!formControlPixKey.val()) {
        formControlPixKey.after(erromsg);
        $(".error-msg span").text("Field required");
        return;
    }
    if(!formControlPixCity.val()) {
        formControlPixCity.after(erromsg);
        $(".error-msg span").text("Field required");
        return;
    }

    prepareObject();
    var json = JSON.stringify(purchase);
    $.ajax({
         url : "http://localhost:8082/buy",
         type : 'post',
         data : json,
         crossDomain: true,
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         beforeSend : function(){
              //$("#resultado").html("ENVIANDO...");
         }
    })
    .done(function(data){
         var response = JSON.parse(JSON.stringify(data));
         amountAux = data;
         console.log(response);
         openModalTotal(data);
    })
    .fail(function(jqXHR, textStatus, msg){
         alert(msg);
    });
}

function addFriend() {
    // remove as mensagens de erro
    $(".erro-msg").remove();

    var erromsg = '<div class="error-msg">Required field</span></div>';
    var name = $('#formControlNameFriend');
    if(!name.val() || name.val().length < 3) {
        name.after(erromsg);
        $(".erro-msg span").text("Field");
        return;
    }

    var combobox = document.querySelector('#formControlFriend');
    var friend = document.createElement('option');
    friend.text = $('#formControlNameFriend').val();
    friend.value = $('#formControlNameFriend').val();

    combobox.add(friend);
    $('#formControlNameFriend').val('');
    $('#formControlFriend').val(friend.value);
    $("#itemFriend").modal('hide');
    $("#itemModal").modal('show');
}

function removeItem(id) {
    items = items.filter(function(item) {
      return item.id !== id;
    });
    console.log(id);
    console.log(items);
}

function addItem(id, type) {
    const item = new Object();
    item.id = id;
    item.amount = $('#formControlAmount').val();
    item.description = $('#formControlDescription').val();
    item.person = $('#formControlFriend').val();
    items.push(item);
    console.log(items);
    $("#itemModal").modal('hide');
}

// funcao remove uma linha da tabela
function removeLine(line) {
  var i=line.parentNode.parentNode.rowIndex;
  document.getElementById('table-item').deleteRow(i);
  removeItem(i);
  console.log("Line: "+line);
}

var identificador = 0;
function addLine(tableId) {

    // remove as mensagens de erro
    $(".error-msg").remove();

    var erromsg = '<div class="error-msg">Required field</span></div>';
    var formControlAmount = $('#formControlAmount');
    var formControlDescription = $('#formControlDescription');
    var formControlFriend = $('#formControlFriend');
    if(!formControlAmount.val()) {
        formControlAmount.after(erromsg);
        $(".error-msg span").text("Field required");
        return;
    }
    if(!formControlDescription.val()) {
        formControlDescription.after(erromsg);
        $(".error-msg span").text("Field format invalid");
        return;
    }
    if(!formControlFriend.val()) {
        formControlFriend.after(erromsg);
        $(".error-msg span").text("Field format invalid");
        return;
    }

    var table = document.getElementById(tableId);
    var numberLines = table.rows.length;
    var line = table.insertRow(numberLines);
    var cell1 = line.insertCell(0);
    var cell2 = line.insertCell(1);
    var cell3 = line.insertCell(2);
    var cell4 = line.insertCell(3);
    var cell5 = line.insertCell(4);
    cell1.innerHTML = identificador = identificador + 1;
    cell2.innerHTML = $('#formControlDescription').val();
    cell3.innerHTML = $('#formControlFriend').val();
    cell4.innerHTML = $("#formControlAmount").val();
    cell5.innerHTML = "<button type='button' onclick='removeLine(this)' class='btn btn-primary'>Remove</button>";
    //Add item
    addItem(numberLines);
}

function addLineTableTotal(chave, valor) {
    var table = document.getElementById('table-total');
    var numberLines = table.rows.length;
    var line = table.insertRow(numberLines);
    var cell1 = line.insertCell(0);
    var cell2 = line.insertCell(1);
    var cell3 = line.insertCell(2);
    cell1.innerHTML = chave;
    cell2.innerHTML = valor;
    console.log("Chave: "+chave);
    cell3.innerHTML = "<button type='button' onclick='charge(\""+chave+"\")' class='btn btn-primary'>Gerar QR</button>";
}