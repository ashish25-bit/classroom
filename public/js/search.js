const input = document.querySelector('.search_container input')
const btn = document.querySelector('.search_container button')

input.addEventListener('keyup', e => {
    if((e.code === 'Enter' || e.keyCode === 13 || e.key === 'Enter') && e.target.value.trim()) 
        search(e.target.value.trim())
})

btn.addEventListener('click', e => {
    if(!input.value.trim()) {
        e.preventDefault()
        alert('Enter a key')
        return
    }
    search(input.value.trim())
})

function search(key) {
    btn.style.opacity = '0.5'
    btn.disabled = true
    location.replace(`/search/class?q=${key}`)
}