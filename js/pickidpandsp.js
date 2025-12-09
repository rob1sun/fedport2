// Refactored PickIdpAndSp script

// Configuration
const CONFIG = {
    urls: {
        idp: 'https://fedfeeds.robertsundin.se/idp/json/multiidp.json',
        sp: 'https://fedfeeds.robertsundin.se/sp/json/splink.json'
    },
    selectors: {
        idpSelectDiv: 'idpSelectDiv',
        spList: 'spList',
        selectIdpHeading: 'selectIdpHeading',
        idpSelect: 'idpSelect',
        idpSelectOpt: 'idpSelectOpt',
        currentIdp: 'currentIdp',
        backToPortal: '.js-back-to-portal',
        showHeader: 'show',
        spFilterList: 'spFilterList',
        spFilterDiv: 'spFilterDiv',
        cardStyleDiv: 'cardStyle',
        customUrlDiv: 'customUrlDiv',
        settingsDiv: 'settings',
        searchInput: 'searchInput',
        showSavedUrls: 'showSavedUrls',
        custUrlHeading: 'custUrlHeading',
        custUrlList: 'custUrlList',
        custNameInput: 'custName',
        custUrlInput: 'custUrl',
        btnCardStyleSubmit: 'btnCardStyleSubmit',
        btnMyPickedServices: 'btnMyPickedServices',
        btnAddCustomUrl: 'btnAddCustomUrl',
        btnSettings: 'btnSettings',
        newIdp: 'newIdp',
        btnSpFilterSettings: 'btnSpFilterSettings',
        cardStyleSettings: 'cardStyleSettings',
        customUrlSettings: 'customUrlSettings',
        clearAll: 'clearAll'
    },
    storageKeys: {
        idpOrgEntity: 'idpOrgEntity',
        idpOrgName: 'idpOrgName',
        cardStyle: 'cardStyle',
        pickedServices: 'pickedServices',
        savedUrls: 'savedUrls'
    }
};

// State
let state = {
    pickedIdp: null,
    cardStyling: 'full',
    customUrlArray: [],
    spFilterSelected: []
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    loadState();
    setupEventListeners();
    checkInitialView();
    updateHeader();

    try {
        await loadIdpData();
        await loadSpData();
    } catch (error) {
        console.error('Error loading data:', error);
    }

    // Load custom URLs after everything else
    loadCustomUrls();
}

function loadState() {
    state.pickedIdp = localStorage.getItem(CONFIG.storageKeys.idpOrgEntity);
    state.cardStyling = getCardStyle(); // Uses the helper function

    const savedUrls = localStorage.getItem(CONFIG.storageKeys.savedUrls);
    state.customUrlArray = savedUrls ? JSON.parse(savedUrls) : [];

    const pickedServices = localStorage.getItem(CONFIG.storageKeys.pickedServices);
    state.spFilterSelected = pickedServices ? JSON.parse(pickedServices) : [];
}

function setupEventListeners() {
    // IDP Select Change
    const idpSelect = document.getElementById(CONFIG.selectors.idpSelect);
    if (idpSelect) {
        idpSelect.addEventListener('change', updateIdp);
    }

    // Back to Portal Buttons
    const backButtons = document.querySelectorAll(CONFIG.selectors.backToPortal);
    backButtons.forEach(btn => {
        btn.addEventListener('click', backToPortal);
    });

    // Card Style Submit
    const btnCardStyleSubmit = document.getElementById(CONFIG.selectors.btnCardStyleSubmit);
    if (btnCardStyleSubmit) {
        btnCardStyleSubmit.addEventListener('click', cardStyleSubmit);
    }

    // My Picked Services Submit
    const btnMyPickedServices = document.getElementById(CONFIG.selectors.btnMyPickedServices);
    if (btnMyPickedServices) {
        btnMyPickedServices.addEventListener('click', myPickedServices);
    }

    // Add Custom URL
    const btnAddCustomUrl = document.getElementById(CONFIG.selectors.btnAddCustomUrl);
    if (btnAddCustomUrl) {
        btnAddCustomUrl.addEventListener('click', addCustomUrl);
    }

    // Search Input
    const searchInput = document.getElementById(CONFIG.selectors.searchInput);
    if (searchInput) {
        searchInput.addEventListener('keyup', searchFilter);
    }

    // Settings Toggle
    const btnSettings = document.getElementById(CONFIG.selectors.btnSettings);
    if (btnSettings) {
        btnSettings.addEventListener('click', toggleSettings);
    }

    // New IDP Button
    const btnNewIdp = document.getElementById(CONFIG.selectors.newIdp);
    if (btnNewIdp) {
        btnNewIdp.addEventListener('click', showNewIdpSelection);
    }

    // SP Filter Settings (Favorites)
    const btnSpFilterSettings = document.getElementById(CONFIG.selectors.btnSpFilterSettings);
    if (btnSpFilterSettings) {
        btnSpFilterSettings.addEventListener('click', showSpFilterSettings);
    }

    // Card Style Settings
    const btnCardStyleSettings = document.getElementById(CONFIG.selectors.cardStyleSettings);
    if (btnCardStyleSettings) {
        btnCardStyleSettings.addEventListener('click', showCardStyleSettings);
    }

    // Custom URL Settings
    const btnCustomUrlSettings = document.getElementById(CONFIG.selectors.customUrlSettings);
    if (btnCustomUrlSettings) {
        btnCustomUrlSettings.addEventListener('click', showCustomUrlSettings);
    }

    // Clear All
    const btnClearAll = document.getElementById(CONFIG.selectors.clearAll);
    if (btnClearAll) {
        btnClearAll.addEventListener('click', clearAllSettings);
    }

    // SP Filter List Change (Delegation)
    const spFilterList = document.getElementById(CONFIG.selectors.spFilterList);
    if (spFilterList) {
        spFilterList.addEventListener('change', handleSpFilterChange);
    }
}

// Helper: Get Card Style (Addresses TODO)
function getCardStyle() {
    let style = localStorage.getItem(CONFIG.storageKeys.cardStyle);
    if (!style) {
        style = 'full';
        localStorage.setItem(CONFIG.storageKeys.cardStyle, style);
    }
    return style;
}

function checkInitialView() {
    const idpSelectDiv = document.getElementById(CONFIG.selectors.idpSelectDiv);
    const spList = document.getElementById(CONFIG.selectors.spList);
    const selectIdpHeading = document.getElementById(CONFIG.selectors.selectIdpHeading);

    if (state.pickedIdp) {
        if (idpSelectDiv) idpSelectDiv.style.display = 'none';
    } else {
        if (spList) spList.style.display = 'none';
        if (idpSelectDiv) idpSelectDiv.style.display = 'block';
        if (selectIdpHeading) selectIdpHeading.innerHTML = "Innan du kan använda portalen så måste du välja inloggning";
    }
}

function updateHeader() {
    const showHeader = document.getElementById(CONFIG.selectors.showHeader);
    const idpName = localStorage.getItem(CONFIG.storageKeys.idpOrgName);
    if (showHeader) {
        showHeader.innerHTML = idpName || "Federationsportalen";
    }
}

async function loadIdpData() {
    const response = await fetch(CONFIG.urls.idp);
    const data = await response.json();
    appendIdpData(data);
}

function appendIdpData(idpData) {
    const idpSelect = document.getElementById(CONFIG.selectors.idpSelect);
    if (!idpSelect) return;

    const dFragIdp = document.createDocumentFragment();

    idpData.forEach(idp => {
        const opt = document.createElement('option');
        opt.textContent = idp.idpDisplayName;
        opt.value = idp.idpEntityId;
        dFragIdp.appendChild(opt);
    });

    idpSelect.appendChild(dFragIdp);
}

function updateIdp() {
    const idpSelect = document.getElementById(CONFIG.selectors.idpSelect);
    const userPickedIdp = idpSelect.value;

    if (!userPickedIdp) return;

    localStorage.setItem(CONFIG.storageKeys.idpOrgEntity, userPickedIdp);

    const selectedText = idpSelect.options[idpSelect.selectedIndex].text;
    localStorage.setItem(CONFIG.storageKeys.idpOrgName, selectedText);

    location.reload();
}

async function loadSpData() {
    const response = await fetch(CONFIG.urls.sp);
    const data = await response.json();
    appendSpData(data);
    appendSpDataFilter(data);
}

function appendSpData(spData) {
    const spList = document.getElementById(CONFIG.selectors.spList);
    if (!spList) return;

    let spFilter = [];
    const pickedServices = localStorage.getItem(CONFIG.storageKeys.pickedServices);

    if (pickedServices) {
        spFilter = JSON.parse(pickedServices);
    } else {
        spFilter = spData.map(sp => sp.spDisplayName);
    }

    // Filter spData based on spFilter
    const result = spData.filter(sp => spFilter.includes(sp.spDisplayName));

    const dFrag = document.createDocumentFragment();

    result.forEach(sp => {
        const concLink = sp.spLink + (state.pickedIdp || '') + sp.spTarget;

        const a = document.createElement('a');
        a.className = "flex-" + state.cardStyling + "item";
        a.setAttribute('href', concLink);
        a.target = "_blank";

        const img = document.createElement('img');
        img.className = "flex-" + state.cardStyling + "item-img";
        img.setAttribute('src', sp.spImg);

        const p = document.createElement('p');
        p.className = "flex-" + state.cardStyling + "item-txt";
        p.innerHTML = sp.spDisplayName;

        a.appendChild(img);
        a.appendChild(p);

        if (state.cardStyling === 'full') {
            const pOrg = document.createElement('p');
            pOrg.className = "flex-item-org";
            pOrg.innerHTML = sp.shortDescription;

            const pDescription = document.createElement('p');
            pDescription.innerHTML = sp.description;
            pDescription.className = "flex-item-description";

            a.appendChild(pOrg);
            a.appendChild(pDescription);
        }

        dFrag.appendChild(a);
    });

    spList.appendChild(dFrag);
}

function appendSpDataFilter(spData) {
    const spFilterList = document.getElementById(CONFIG.selectors.spFilterList);
    if (!spFilterList) return;

    const dFragFilter = document.createDocumentFragment();

    spData.forEach(sp => {
        const liFilter = document.createElement('li');
        liFilter.className = "li";

        const imgFilter = document.createElement('img');
        imgFilter.className = "img";
        imgFilter.setAttribute('src', sp.spImg);

        const inpFilter = document.createElement('input');
        inpFilter.className = "inp";
        inpFilter.type = "checkbox";
        inpFilter.id = sp.spDisplayName;
        inpFilter.name = sp.spDisplayName;
        inpFilter.value = sp.spDisplayName;

        // Pre-select if in favorites
        if (state.spFilterSelected.includes(sp.spDisplayName)) {
            inpFilter.checked = true;
        }

        const labelFilter = document.createElement('label');
        labelFilter.className = "label";
        labelFilter.setAttribute('for', sp.spDisplayName);
        labelFilter.innerHTML = sp.spDisplayName;

        liFilter.appendChild(inpFilter);
        liFilter.appendChild(imgFilter);
        liFilter.appendChild(labelFilter);

        dFragFilter.appendChild(liFilter);
    });

    spFilterList.appendChild(dFragFilter);
}

function handleSpFilterChange(event) {
    if (event.target.type === 'checkbox') {
        const checked = document.querySelectorAll('#' + CONFIG.selectors.spFilterList + ' input[type="checkbox"]:checked');
        state.spFilterSelected = Array.from(checked).map(x => x.value);
    }
}

function loadCustomUrls() {
    if (state.customUrlArray.length > 0) {
        showCustUrls();
        insertCustUrls();
    } else {
        const custUrlHeading = document.getElementById(CONFIG.selectors.custUrlHeading);
        if (custUrlHeading) custUrlHeading.innerHTML = "";
    }
}

function addCustomUrl() {
    const custNameInput = document.getElementById(CONFIG.selectors.custNameInput);
    const custUrlInput = document.getElementById(CONFIG.selectors.custUrlInput);

    if (!custNameInput || !custUrlInput) return;

    const customUrlObject = {
        custName: custNameInput.value,
        custUrl: custUrlInput.value
    };

    state.customUrlArray.push(customUrlObject);
    localStorage.setItem(CONFIG.storageKeys.savedUrls, JSON.stringify(state.customUrlArray));

    showCustUrls();
    insertCustUrls();
}

function showCustUrls() {
    const showSavedUrls = document.getElementById(CONFIG.selectors.showSavedUrls);
    if (!showSavedUrls) return;

    showSavedUrls.innerHTML = "";

    state.customUrlArray.forEach((urlObj, index) => {
        const custUrlRow = document.createElement('tr');

        const custUrlNameTd = document.createElement('td');
        custUrlNameTd.innerText = urlObj.custName;

        const custUrlLinkTd = document.createElement('td');
        custUrlLinkTd.innerHTML = urlObj.custUrl;

        const custUrlButtonTd = document.createElement('td');
        const custUrlRemBut = document.createElement('button');
        custUrlRemBut.innerHTML = "Ta bort";
        custUrlRemBut.addEventListener('click', () => remCustUrl(index));

        custUrlButtonTd.appendChild(custUrlRemBut);

        custUrlRow.appendChild(custUrlNameTd);
        custUrlRow.appendChild(custUrlLinkTd);
        custUrlRow.appendChild(custUrlButtonTd);

        showSavedUrls.appendChild(custUrlRow);
    });
}

function remCustUrl(index) {
    state.customUrlArray.splice(index, 1);
    localStorage.setItem(CONFIG.storageKeys.savedUrls, JSON.stringify(state.customUrlArray));
    showCustUrls();
    insertCustUrls();
}

function insertCustUrls() {
    const custUrlHeading = document.getElementById(CONFIG.selectors.custUrlHeading);
    if (custUrlHeading) {
        if (state.customUrlArray.length > 0) {
            custUrlHeading.innerHTML = "<hr><br>Egna länkar utan direktinloggning";
        } else {
            custUrlHeading.innerHTML = "";
        }
    }

    const custUrlList = document.getElementById(CONFIG.selectors.custUrlList);
    if (!custUrlList) return;

    custUrlList.innerHTML = "";

    state.customUrlArray.forEach(urlObj => {
        const custUrlA = document.createElement("a");
        custUrlA.className = "flex-miniitem";
        custUrlA.setAttribute("style", "color:black !important; background-color:#E8E8E8 !important");
        custUrlA.setAttribute('href', urlObj.custUrl);
        custUrlA.target = "_blank";

        const custUrlName = document.createElement("p");
        custUrlName.className = "flex-miniitem-txt";
        custUrlName.innerHTML = urlObj.custName;

        const custUrlImg = document.createElement('img');
        custUrlImg.className = "flex-miniitem-img";
        custUrlImg.setAttribute('src', "img/custurl.png");

        custUrlA.appendChild(custUrlImg);
        custUrlA.appendChild(custUrlName);

        custUrlList.appendChild(custUrlA);
    });
}

// User Actions
function toggleSettings() {
    const settingsDiv = document.getElementById(CONFIG.selectors.settingsDiv);
    const idpSelectDiv = document.getElementById(CONFIG.selectors.idpSelectDiv);

    if (settingsDiv.style.display === "none") {
        settingsDiv.style.display = "flex";
    } else {
        settingsDiv.style.display = "none";
        if (idpSelectDiv) idpSelectDiv.style.display = "none";
    }
}

function showNewIdpSelection() {
    const idpSelectDiv = document.getElementById(CONFIG.selectors.idpSelectDiv);
    if (idpSelectDiv.style.display === "none") {
        idpSelectDiv.style.display = "block";
        document.getElementById(CONFIG.selectors.selectIdpHeading).innerHTML = "Välj en ny inloggning eller gå tillbaka till portalen";
        document.getElementById(CONFIG.selectors.idpSelectOpt).innerHTML = "Byt inloggning";
        document.getElementById(CONFIG.selectors.currentIdp).innerHTML = "Nuvarande val är: " + localStorage.getItem(CONFIG.storageKeys.idpOrgName);

        const backBtns = document.querySelectorAll(CONFIG.selectors.backToPortal);
        backBtns.forEach(btn => btn.style.display = ""); // Show back buttons

        alert("Du kommer nu att kunna göra om ditt val av organisation, men tänk på att om du redan har loggat in i en tjänst så kommer tjänsten att komma ihåg den inloggningen. Du kan därför behöva stänga webbläsaren och öppna portalen igen.");
    } else {
        idpSelectDiv.style.display = "none";
    }
}

function showCardStyleSettings() {
    const el = document.getElementById(CONFIG.selectors.cardStyleDiv);
    el.style.display = (el.style.display === "none") ? "block" : "none";
}

function cardStyleSubmit() {
    const radios = document.getElementsByName('cardStyle');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            localStorage.setItem(CONFIG.storageKeys.cardStyle, radios[i].value);
            location.reload();
        }
    }
}

function showSpFilterSettings() {
    const el = document.getElementById(CONFIG.selectors.spFilterDiv);
    if (el.style.display === "none") {
        // state.spFilterSelected is already loaded from localStorage in init()
        el.style.display = "block";
    } else {
        el.style.display = "none";
    }
}

function showCustomUrlSettings() {
    const el = document.getElementById(CONFIG.selectors.customUrlDiv);
    el.style.display = (el.style.display === "none") ? "block" : "none";
}

function myPickedServices() {
    if (state.spFilterSelected.length < 1) {
        if (confirm('Du har inte valt några tjänster. Klickar du OK så kommer inga tjänster att visas i portalen (om du lagt till egna länkar så kommer endast dessa att visas i portalen). Vill du fortsätta?')) {
            addMyPickedServices();
        }
    } else {
        addMyPickedServices();
    }
}

function addMyPickedServices() {
    localStorage.setItem(CONFIG.storageKeys.pickedServices, JSON.stringify(state.spFilterSelected));
    document.getElementById(CONFIG.selectors.spFilterDiv).style.display = "none";
    document.getElementById(CONFIG.selectors.settingsDiv).style.display = "none";
    location.reload();
}

function backToPortal() {
    const divs = [
        CONFIG.selectors.idpSelectDiv,
        CONFIG.selectors.settingsDiv,
        CONFIG.selectors.cardStyleDiv,
        CONFIG.selectors.spFilterDiv,
        CONFIG.selectors.customUrlDiv
    ];

    divs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
}

function clearAllSettings() {
    if (confirm('Är du säker på att du vill rensa alla inställningar?')) {
        localStorage.clear();
        location.reload();
    }
}

function searchFilter() {
    const input = document.getElementById(CONFIG.selectors.searchInput);
    const filter = input.value.toUpperCase();
    const div = document.getElementById(CONFIG.selectors.spList);
    const a = div.getElementsByTagName("a");

    for (let i = 0; i < a.length; i++) {
        const p = a[i].getElementsByTagName("p")[0];
        const txtValue = a[i].textContent || p.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}
