const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fs = require('fs/promises')

const cells = ['recommendedTags', 'specialRecommendedTags','orignalTags',  'title', 'content']

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
                        'name': currentColumn[k],
                        'score': currentColumn[k+1]
                    }
                    tags.push(scoredTag)
                }                
                obj[cells[i]] = tags                    
            } else if (i === 2) {
                let tags = []
                for (let k = 0; k < currentColumn.length; k++) 
                    tags.push(currentColumn[k])
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
    res.sendFile(path.join(__dirname + "/index.html"))
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

app.listen(port)