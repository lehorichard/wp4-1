const title = document.getElementsByTagName('h1')
for (const elem of title) {
    elem.innerText = "Different Title"
}
const content = document.getElementById('content')
const response = fetch('/data')
    .then(response => response.json())
    .then(data => content.innerText  = JSON.stringify(data.slice(0,5)))
