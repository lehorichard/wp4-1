const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path')
const fs = require('fs').promises

app.use('/', express.static('public'))
const cells = ['recommendedTags', 'specialRecommendedTags','orignalTags',  'title', 'content']
const substrings = ['genre__', 'year__', 'author__']

async function loadData() {
    const data = await fs.readFile('data.txt', 'utf8')    
    const array = data.split(/\r?\n/)   
    const res = array.map((e) => {
        let obj = {}
        for (let i = 0, l = e.split('$$$').length;  i < l; i++) {
            const currentColumn = e.split('$$$')[i].trim().split(' ')
            if (i === 0 || i  === 1) {
                let tags = []
                //const skipper = i  ?  1 : 0
                for (let k = 0; k <  currentColumn.length; k += 2) {   
                    let scoredTag = {
                        'name': currentColumn[k].replace('__label__', '').split('@@').join(' '),
                        'score': currentColumn[k+1]
                    }
                    tags.push(scoredTag)
                }                
                obj[cells[i]] = tags                    
            } else if (i === 2) {
                let tags = []
                for (let k = 0; k < currentColumn.length; k++)
                    if (!substrings.some(s => currentColumn[k].includes(s)))
                        tags.push(currentColumn[k].replace('__label__', '').split('@@').join(' '))
                obj[cells[i]] = tags
            }
            else 
                obj[cells[i]] = e.split('$$$')[i].trim()
        }
        return obj
    })
    return res
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/public/index.html"))
})

app.get('/style.css',  (req, res) => {
    res.sendFile(__dirname + "/" + "style.css");
});

app.get('/script.js',  (req, res) => {
    res.sendFile(__dirname + "/" + "script.js");
});

app.get('/data', async(req, res) => {
    const ret = await loadData()
    res.json(ret)
})

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})