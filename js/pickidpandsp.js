// XXXXXXXXXXXXXXXXX <TODO> XXXXXXXXXXXXXXXXXXXX
//- Lägg till "är du säker på?" vid klick på återställ | KLART
//- Möjlighet att ta bort egen länk | KLART
//- Markera/avmarkera alla på filtersidan
//- Visa vilka tjänster som redan är valda på filtersidan
//- Om man aktivt valt att avmarkera alla tjänster så blir sidan tom. Behålla så eller inte? Kanske bra om även egna länkar.
//- Gör en pil eller något i knappen som togglar menyn så man förstår att man öppnar/stänger
//- Visa egna länkar i SSO-vyn
//- Ladda om egna länkar i SSO-vyn om man lagt till eller tagit bort en länk
//- Snyggare visning av egna länkar i vyn för egna länkar
//- Kontroll av cardstyle på två ställen i koden - gör om till function
//- Snyggare IdP-val med logga och beskrivande text
//- Avsnitt "Hjälp"
//- Parkera portal v2 och se över förbättringar till v3 (ex: GUI, alfabetisk oavsett versaler, egen sortering mm)
// XXXXXXXXXXXXXXXXX </TODO> XXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXX <GLOBALA VARIABLER> XXXXXXXXXXXXXXXXXXXX
var pickedIdp; //vald IdP
var cardStyling; //Utseende på SSO-korten
var customUrlArray; //Array för egna länkar
var stringCustomUrl; // För att läsa in egna länkar i html (radera om annan metod i senare kod)

// XXXXXXXXXXXXXXXXX </GLOBALA VARIABLER> XXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXX <INTIERING OCH KONTROLL AV TIDIGARE SPARADE VÄRDEN I LOCAL STORAGE> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Kolla om det redan finns en vald IdP sen tidigare
if (localStorage.getItem("idpOrgEntity") !== null) {
	document.getElementById("idpSelectDiv").style.display = "none";
  } else {
    document.getElementById("spList").style.display = "none";
	document.getElementById("idpSelectDiv").style.display = "block";
	document.getElementById("selectIdpHeading").innerHTML="Innan du kan använda portalen så måste du välja inloggning";
  }

//kolla om cardStyle är valt annars sätt default full - - GÖR OM TILL FUNCTION EFTERSOM SAMMA KOD ÄVEN EFTER IDP-VAL
if (localStorage.getItem("cardStyle") == null) {
	localStorage.setItem("cardStyle","full");
  }
//Sätt variabel som används för att välja css för utseende på SSO-korten
localStorage.getItem("cardStyle");

// XXXXXXXXXXXXXXXXX </KONTROLL AV TIDIGARE SPARADE VÄRDEN I LOCAL STORAGE> XXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXX <ANVÄNDARORGANISATION> XXXXXXXXXXXXXXXXXXXXXXXX

//Läs in IdP-array från json och...
		fetch('https://fedfeeds.robertsundin.se/idp/json/multiidp.json')
            .then(function (idpResponse) {
                return idpResponse.json();
            })
            .then(function (idpData) {
                appendIdpData(idpData);
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });

//Append json och...
        function appendIdpData(idpData) {
			
            for (let y = 0; y < idpData.length; y++) {
				let idpDisplayName = idpData[y].idpDisplayName
				let idpEntityId = idpData[y].idpEntityId
				let idpImg = idpData[y].idpImg

//Skapa lista för IdP-val och infoga på sida
const dFragIdp = document.createDocumentFragment();
const opt = document.createElement('option');

  opt.textContent = idpDisplayName;
  opt.value = idpEntityId;
  
  dFragIdp.appendChild(opt);
  
  document.getElementById("idpSelect").appendChild(dFragIdp);
		}}
  
//När användaren valt - skriv vald entityID till localStore och...
 function updateIdp() {
  let userPickedIdp = document.getElementById("idpSelect").value;
  localStorage.setItem("idpOrgEntity",userPickedIdp);
  
// sätt text från selected option som variabel och ladda om dokumentet
const pickedIdpDisplay = (el) => {
  if (el.selectedIndex === -1) {
    return null;
  }
  return el.options[el.selectedIndex].text;
}
const select = document.querySelector('select')
const text = pickedIdpDisplay(select);
localStorage.setItem("idpOrgName",text);
  
  location.reload();

 }
// Uppdatera global variabel för vald IdP
  pickedIdp = localStorage.getItem("idpOrgEntity");

// Kolla om IdP finns i localStore och infoga text för vald option i dokumentet - annars default text
if (localStorage.getItem("idpOrgEntity") !== null) {
	document.getElementById("show").innerHTML = localStorage.getItem("idpOrgName");
  } else {
    document.getElementById("show").innerHTML = "Federationsportalen";
  }
  
//kolla om cardStyle är valt annars sätt default full - GÖR OM TILL FUNCTION EFTERSOM SAMMA KOD ÄVEN I INLEDANDE KONTROLL (och inte ligga här)
if (localStorage.getItem("cardStyle") == null) {
	localStorage.setItem("cardStyle","full");
  }
//Sätt variabel som används för att välja css för utseende på korten
cardStyling=localStorage.getItem("cardStyle");

// XXXXXXXXXXXXXXXXXXXXXXXXX </ANVÄNDARORGANISATION> XXXXXXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXXXXXXXXXX <TJÄNSTER> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Läs in SP-array från JSON
		fetch('https://fedfeeds.robertsundin.se/sp/json/splink.json')
            .then(function (spResponse) {
                return spResponse.json();
            })
            .then(function (spData) {
                appendSpData(spData);
				appendSpDataFilter(spData);//för sidan med val av visade tjänster
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });

//Append json och...
        function appendSpData(spData) {

//Hämta valda tjänster ur localStorage. Om null fyll array (inte localStorage) med alla spDisplayName och...
let spFilter= [];

if (localStorage.getItem("pickedServices") !== null){
spFilter = JSON.parse(localStorage.getItem("pickedServices"))
} 
else {

           for (let x = 0; x < spData.length; x++) {
				fullServices = spData[x].spDisplayName;
				spFilter.push(fullServices); 
}
}

//Matcha SP-feed mot array med valda SP och...
 for (let y = 0; y < spFilter.length; y++) {
	let obj = [{"spData_spDisplayName": spFilter[y]}];
			
	let result = spData.filter(c => obj.some(s => s.spData_spDisplayName === c.spDisplayName));	  


//Generera innehåll i SSO-kort och...
            for (let x = 0; x < result.length; x++) {
				let concLink = result[x].spLink + pickedIdp + result[x].spTarget;
				spDisplayName = result[x].spDisplayName;
				let spImg = result[x].spImg;
				let spShortDescription = result[x].shortDescription
				let spDescription = result[x].description

				
//Skapa lista med SSO-kort och infoga på sida
const dFrag = document.createDocumentFragment();

  const a = document.createElement('a');
  a.className = "flex-"+cardStyling+"item";
  a.setAttribute('href', concLink);
  a.target = "_blank";
  const img = document.createElement('img');
  img.className = "flex-"+cardStyling+"item-img";
  img.setAttribute('src', spImg);
  const p = document.createElement('p');
  p.className = "flex-"+cardStyling+"item-txt";
  p.innerHTML = spDisplayName;
  const pOrg = document.createElement('p');
  pOrg.className = "flex-item-org";
  pOrg.innerHTML = spShortDescription;
  const pDescription = document.createElement('p');
  pDescription.innerHTML = spDescription;
  pDescription.className = "flex-item-description";
  

  dFrag.appendChild(a);
  a.appendChild(img);
  a.appendChild(p);
  
//Utseende på SSO-kort om fyllig stil valts
if (localStorage.getItem("cardStyle")=="full"){
  a.appendChild(pOrg);
  a.appendChild(pDescription);
}

  document.getElementById('spList').appendChild(dFrag);
		}}}
// XXXXXXXXXXXXXXXXXXXXXXXXX </TJÄNSTER> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXXXXXXXXXX <VAL AV VISADE TJÄNSTER> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Generera innehåll i lista med tjänster och...			
			function appendSpDataFilter(spData) {

            for (let x = 0; x < spData.length; x++) {
				let concLink = spData[x].spLink + pickedIdp + spData[x].spTarget;
				let spDisplayName = spData[x].spDisplayName
				let spImg = spData[x].spImg
				let spShortDescription = spData[x].shortDescription
				let spDescription = spData[x].description
 
 //Skapa lista för val av tjänster och infoga på sida
const dFragFilter = document.createDocumentFragment();
				
  const liFilter = document.createElement('li');
  liFilter.className = "li";
  
  const imgFilter = document.createElement('img');
  imgFilter.className = "img";
  imgFilter.setAttribute('src', spImg);
  
  const inpFilter = document.createElement('input');
  inpFilter.setAttribute('class', "inp");
  inpFilter.setAttribute('type', "checkbox");
  inpFilter.setAttribute('id', spDisplayName);
  inpFilter.setAttribute('name', spDisplayName);
  inpFilter.setAttribute('value', spDisplayName);
  
  const labelFilter = document.createElement('label');
  labelFilter.className = "label";
  labelFilter.setAttribute('for', spDisplayName); //KOLLA OM DENNA BEHÖVS
  labelFilter.innerHTML = spDisplayName;
  
  dFragFilter.appendChild(liFilter);
  liFilter.appendChild(inpFilter);
  liFilter.appendChild(imgFilter);
  liFilter.appendChild(labelFilter);
  
document.getElementById('spFilterList').appendChild(dFragFilter);

}}

//Hämta värden i filterlista och skriv till localStorage
document.querySelectorAll('input[type="checkbox"]:checked')

const ul = document.querySelector('ul')
let selected = [];

ul.addEventListener('change', event => {
  if (event.target.type === 'checkbox') {
    const checked = document.querySelectorAll('input[type="checkbox"]:checked')
    selected = Array.from(checked).map(x => x.value)
	}
})

// XXXXXXXXXXXXXXXXXXXXXXXXX </VAL AV VISADE TJÄNSTER> XXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXX <EGNA LÄNKAR> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Kolla om det finns sparade länkar sedan tidigare och läs i så fall in dem på sidan - else - tom array
if (localStorage.getItem("savedUrls") !== null){
	customUrlArray = JSON.parse(localStorage.getItem("savedUrls"));
	//stringCustomUrl = JSON.stringify(customUrlArray);
	showCustUrls();
}
else {
	customUrlArray = [];
}

//Lägg till ny egen länk
function addCustomUrl(){
	let customUrlObject = {custName:custName.value, custUrl:custUrl.value};
	customUrlArray.push(customUrlObject);
		stringCustomUrl = JSON.stringify(customUrlArray);
		localStorage.setItem("savedUrls",stringCustomUrl);
		document.getElementById("showSavedUrls").innerHTML="";
		showCustUrls();
		insertCustUrls();
		
}

//Visa de tillagda länkarna på settingssidan !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		function showCustUrls() {
			
		let custUrlList = document.getElementById("showSavedUrls") 
 
           for (let x = 0; x < customUrlArray.length; x++) {
				let custName = customUrlArray[x].custName
				let custUrl = customUrlArray[x].custUrl
						
			let custUrlLi = document.createElement('li');
			custUrlLi.innerText = custName;
			let custUrlP = document.createElement('p');
			custUrlP.innerHTML = custUrl;
			//Lägg till knapp för att ta bort länk
			let custUrlRemBut = document.createElement('button');
			custUrlRemBut.value = x;
			custUrlRemBut.innerHTML = "Ta bort";
			custUrlRemBut.addEventListener('click', remCustUrl);
				
            custUrlList.appendChild(custUrlLi);
			custUrlList.appendChild(custUrlP);
			custUrlList.appendChild(custUrlRemBut);
		   }
		}
// Ta bort länkt vid klick
function remCustUrl(){
	customUrlArray.splice((this.value), 1);
	stringCustomUrl = JSON.stringify(customUrlArray);
	localStorage.setItem("savedUrls",stringCustomUrl);
	document.getElementById("showSavedUrls").innerHTML="";
	showCustUrls();
	insertCustUrls();
}
//Infoga egna länkar i SSO-vyn
		
function insertCustUrls(){

	if ((localStorage.getItem("savedUrls")) === null || (localStorage.getItem("savedUrls")) === "[]"){
	document.getElementById("custUrlHeading").innerHTML = "";
	} else {
		document.getElementById("custUrlHeading").innerHTML = "Egna länkar utan direktinloggning";
	}
	
	document.getElementById("custUrlList").innerHTML = "";
		
		let custUrlList = document.getElementById("custUrlList")
		
           for (let x = 0; x < customUrlArray.length; x++) {
				let custName = customUrlArray[x].custName
				let custUrl = customUrlArray[x].custUrl
				          
			
			const custUrlA = document.createElement("a");
			custUrlA.className = "flex-"+cardStyling+"item";
			custUrlA.setAttribute('href', custUrl);
			custUrlA.target = "_blank";
			custUrlA.innerHTML = custName;
			
			const custUrlP = document.createElement('p');
			custUrlP.className = "flex-item-description";
			custUrlP.innerHTML = "Den här länken har du lagt till själv och den har inte direktinloggning.";
			
			const custUrlImg = document.createElement('img');
			custUrlImg.className = "flex-"+cardStyling+"item-img";
			custUrlImg.setAttribute('src', "img/custurl.png");
			
			custUrlList.appendChild(custUrlA);
			custUrlA.appendChild(custUrlImg);
			
			//Utseende på SSO-kort om fyllig stil valts
			if (localStorage.getItem("cardStyle")=="full"){
			custUrlA.appendChild(custUrlP);
			}
			}
			}


			
// XXXXXXXXXXXXXXXXXXXXXXXXX </EGNA LÄNKAR> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXXXXXXXXXX <DIVERSE FUNKTIONER SOM INITIERAS AV ANVÄNDAREN> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Visa och dölj inställningar - toggla knappen
function settings() {
  var x = document.getElementById("settings");
  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
	document.getElementById("idpSelectDiv").style.display="none";
  }
}

// Visa IdP-val för att kunna välja ny IdP
function newIdp() {
  var x = document.getElementById("idpSelectDiv");
  if (x.style.display === "none") {
    x.style.display = "block";
	document.getElementById("selectIdpHeading").innerHTML="Välj en ny inloggning eller gå tillbaka till portalen";
	document.getElementById("idpSelectOpt").innerHTML="Byt inloggning";
	document.getElementById("currentIdp").innerHTML="Nuvarande val är: "+localStorage.getItem("idpOrgName");
	document.getElementById("backToPortal").style.display="";
	alert("Du kommer nu att kunna göra om ditt val av organisation, men tänk på att om du redan har loggat in i en tjänst så kommer tjänsten att komma ihåg den inloggningen. Du kan därför behöva stänga webbläsaren och öppna portalen igen.");
  } else {
    x.style.display = "none";
	
  }
}

//Visa card style settings
function cardStyleSettings() {
  var x = document.getElementById("cardStyle");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
	
  }
}

//Skriv vald card style till local storage
function cardStyleSubmit() {
    var ele = document.getElementsByName('cardStyle');
    for (i = 0; i < ele.length; i++) {
    if (ele[i].checked)
        localStorage.setItem("cardStyle", ele[i].value);
	    location.reload();
            }
        }

//Visa val av visade tjänster
function spFilterSettings() {
  var x = document.getElementById("spFilterDiv");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
	
  }
}

//Visa sida för att lägga till egna URL
function customUrlSettings() {
  var x = document.getElementById("customUrlDiv");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
	
  }
}

//Skriv val av visade tjänster till localStorage och tillbaka till huvudsida
  function myPickedServices() {
  let string = JSON.stringify(selected);
  localStorage.setItem("pickedServices",string);
  document.getElementById("spFilterDiv").style.display="none";
  document.getElementById("settings").style.display="none";
  location.reload();
  }	

//Tillbaka till portal från settings-sida
function backToPortal() {
	document.getElementById("idpSelectDiv").style.display="none";
	document.getElementById("settings").style.display="none";
	document.getElementById("cardStyle").style.display="none";
	document.getElementById("spFilterDiv").style.display="none";
	document.getElementById("customUrlDiv").style.display="none";
}

//Rensa localStorage och ladda om dokumentet
function clearAll() {
	
	if (confirm('Är du säker på att du vill rensa alla inställningar?')) {
		localStorage.clear();
		location.reload();
		}
		}

//Sökfilter i top-bar
function searchFilter() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("spList");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        p = a[i].getElementsByTagName("p")[0];
        txtValue = a.textContent || p.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

// XXXXXXXXXXXXXXXXXXXXXXXXX </DIVERSE FUNKTIONER SOM INITIERAS AV ANVÄNDAREN> XXXXXXXXXXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXXXXXXXXXX <FUNKTIONER SOM UTFÖRS EFTER ATT DOKUMENTET LADDATS> XXXXXXXXXXXXXXXXXXXXXXXXX

//Append egna länkar i SSO-vyn (om de finns)
document.getElementById("custUrlList").onload = insertCustUrls();

// XXXXXXXXXXXXXXXXXXXXXXXXX </FUNKTIONER SOM UTFÖRS EFTER ATT DOKUMENTET LADDATS> XXXXXXXXXXXXXXXXXXXXXXXXX