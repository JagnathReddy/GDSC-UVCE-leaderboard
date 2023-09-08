import { Runtime, Library, Inspector } from "./runtime.js";
import {define} from "./data.js"
const runtime = new Runtime();
const main = runtime.module(define, Inspector.into(document.getElementById("chart")));

const dataPromise = await fetch("https://script.googleusercontent.com/macros/echo?user_content_key=Ej2zmDSjtsTZmyuOwLvL-pD5rMQ-BlJ6kONb_jAEn3wtGN7aHKOB5Z0BYKAYJbb02JJMEKLXTe5Rc9xeA1TpJZZCxnw1_IxGm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnP8adMQxNixxEOh7eekiwmkhxnKmXbB2vJUvDFFx0-lP2TWAjzfGbjUjIxukSZ1LnBqGfKiy7R1fj_Zmm6qIudCwUZFB9yWeGoTlcIxRdDxnyBAf43AAwP8&lib=M49r6yKs4LO_EbIQqCbREBawVLJsp4bmx");
const data = await dataPromise.json();
    

    setTimeout(function () {
        document.querySelector(".overlay").style.display = "none";
    }, 1000); 
data.sort((a,b)=>{
    return b.completed - a.completed;
})
let innerHtml = ""
for (let i = 0; i < data.length; i++) {
    let completed = data[i].completed != 0 ? "Yes" : "No";
    let template = `<tr id="listItem" student=${data[i].name}>
                                    <th scope="row">${i + 1}</th>
                                    <td>${data[i].name}</td>
                                    <td>${completed}</td>
                                    <td>${Math.max(0, data[i].completed - 1)}</td>
                                </tr>`;
    innerHtml += template;
}
document.getElementById("tableBody").innerHTML = innerHtml;
console.log(data);
