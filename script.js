const url = '/data'
const title = document.getElementsByTagName('h1')
for (const elem of title) {
    elem.innerText = "címkeajánló - HETILAP"
}
let data = []
let current = 0
let titles = []
let globalSelected = 0
let minProbability = 0.0
let min3 = false
let p = 0.0
let r = 0.0

const content = document.getElementById('article-content')
const originalTags = document.getElementById('original-tags')
const originalTagsMisc = document.getElementById('original-tags-misc')
const recommendedTags = document.getElementById('rec-tags')
const recommendedTagsMisc = document.getElementById('rec-tags-misc')
const probPercent = document.getElementById('probPercent')
const range = document.getElementById('probablityRange')


function onTitleClick(sel) {
    globalSelected = Number(sel.value)
    const selector = document.getElementById('title-selector')
    content.innerText = data[sel.value].content
    loadTags()
}

function setTitles(from) {    
    const len = data.length
    const sel = document.getElementById('title-selector')
    for (let i = sel.length - 1; i >= 0; i--) {
        sel.remove(i)        
    }
    titles.length = 0
    for (let i = 0; i < 20; i++) {
        const obj = {
            id: from,
            title: data[from].title
        }
        if (from < len - 1)
            from++
        else
            from = 0
        titles.push(obj)
    }
    loadTitles(titles)
    content.innerText = data[globalSelected].content
    //console.log(data[globalSelected]);
    loadTags()
}

function setCurrent(count) {
    const len = data.length
    if (count+current>=len) {
        current = 0 + ((current + count) - len)
        globalSelected = 0 + ((globalSelected + count) - len)
    } else if (count + current < 0) {
        current = len - (Math.abs(count) - current)
        globalSelected = len - (Math.abs(count) - globalSelected)
    } else {
        current += count
        globalSelected += count
    }
    setTitles(current)
}

async function getData(url) {
    const response = await fetch(url)
    data = await response.json()
    //console.log(data)
    content.innerText = data[globalSelected].content
    //console.log(data[globalSelected]);
    data.slice(0,20).forEach((e, i) => {
        const obj = {
            id : i,
            title : e.title,
        }
        titles.push(obj)
    })
    loadTitles(titles)
    changeProbability(0.0)
    range.value = 0
    changeMin3()
    loadTags()
}

function loadTitles(titles) {
    titles.forEach(element => {
        let opt = document.createElement("option")
        opt.value = element.id
        opt.text = element.title
        const sel = document.getElementById('title-selector')
        sel.add(opt)
        if (element.id === globalSelected)
            sel.value = globalSelected
    });
}

const round = (num) => Math.round((num + Number.EPSILON) * 1000) / 1000

function loadTags() {
    const tags = data[globalSelected].orignalTags
    const recTags = data[globalSelected].recommendedTags
    const specRecTags = data[globalSelected].specialRecommendedTags
    const substrings = ['geography__', 'organization__', 'person__']
    const recTagsNames = recTags.map(element => element.name)
    const specRecTagsNames = specRecTags.map(element => element.name).filter(x => !recTagsNames.includes(x))
    let hmm = specRecTagsNames.filter(x => !recTagsNames.includes(x)).filter(x => tags.includes(x))
    let hmm2 = recTagsNames.filter(x => tags.includes(x))
    console.log(hmm.length + hmm2.length, tags.length);
    // precision
    p = (hmm.length + hmm2.length) / (recTags.length + specRecTagsNames.length)
    // recall
    r = (hmm.length + hmm2.length) / tags.length
    document.getElementById('precision').innerText = `P: ${round(p)}`
    document.getElementById('recall').innerText = `R: ${round(r)}`
    originalTags.innerText = ''
    originalTagsMisc.innerText = ''
    recommendedTags.innerText = ''
    recommendedTagsMisc.innerText = ''
    tags.forEach(e => {
        if (substrings.some(s => e.includes(s)))
            originalTagsMisc.innerText += e + "\n"
        else
            originalTags.innerText += e + "\n"
    });

    recTags.forEach((e, i) => {
        const score = Number(e.score) 
        if (min3 === false) {
            if (score >= minProbability)
                recommendedTags.innerText += e.name + ` (${score})` + "\n"
        } else {                   
            if (i < 3)
                recommendedTags.innerText += e.name + ` (${score})` + "\n"
            else if (score >= minProbability)
                recommendedTags.innerText += e.name + ` (${score})` + "\n"
        }
    })
    let counter = 0
    specRecTags.forEach((e, i) => {
        const score = Number(e.score)
        if (substrings.some(s => e.name.includes(s))) {
            if (min3 === false) {               
                if (score >= minProbability) {
                    recommendedTagsMisc.innerText += e.name + ` (${score})` + "\n"
                }
            } else {                   
                if (counter < 3) {                    
                    recommendedTagsMisc.innerText += e.name + ` (${score})` + "\n"
                } else if (score >= minProbability) {                    
                    recommendedTagsMisc.innerText += e.name + ` (${score})` + "\n"
                }
                counter++
            }
        }        
    })
}

function changeProbability(value) {
    minProbability = value
    probPercent.innerText = value
    loadTags()
}

function changeMin3() {
    if (document.getElementById('min3').checked)
        min3 = true
    else
        min3 = false
    loadTags()
}

getData(url)