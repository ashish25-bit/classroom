import { displayContainer, postAnnouncement, getClassUid } from '../module/class.js'
const post = document.querySelector('.post')
const post_input = document.querySelector('.announcement_input div')
const docs_btn = document.querySelector('.docs_btn')
const anounce_btn = document.querySelector('.anouncements_btn')
const document_con = document.querySelector('.document_con')
const announcement_con = document.querySelector('.announcement_con')
const context = document.querySelector('.context')
const addLink = document.querySelector('.add_link')
const linkHref = document.querySelector('.link_url')
const linkName = document.querySelector('.link_title')

docs_btn.addEventListener('click', () => {
    if (!docs_btn.classList.contains('active')) {
        displayContainer(docs_btn, anounce_btn, document_con, announcement_con)
    }
})

anounce_btn.addEventListener('click', () => {
    if (!anounce_btn.classList.contains('active'))
        displayContainer(anounce_btn, docs_btn, announcement_con, document_con)
})

post.addEventListener('click', () => {
    if (!post_input.innerHTML || !context.value) {
        alert('Cannot Post Empty Annoucement.')
        return
    }

    post.disabled = true
    post.style.opacity = 0.5
    const name = getClassUid()
    postAnnouncement(context, post, post_input, name)
})

addLink.addEventListener('click', () => {
    if (!linkHref.value) {
        alert('Enter atleast the link')
        return
    }
    const tag = `<a href=${linkHref.value}>${!linkName.value ? linkHref.value : linkName.value}</a>`
    post_input.innerHTML += tag
    linkName.value = ''
    linkHref.value = ''
})