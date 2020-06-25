import { displayContainer, postAnnouncement, getClassUid, getAnnouncements } from '../module/class.js'
const post = document.querySelector('.post')
const post_input = document.querySelector('.announcement_input div')
const docs_btn = document.querySelector('.docs_btn')
const anounce_btn = document.querySelector('.anouncements_btn')
const document_con = document.querySelector('.document_con')
const announcement_con = document.querySelector('.announcement_con')
const announcements = document.querySelector('.announcements')
const context = document.querySelector('.context')
let response_msg = document.querySelector('.response_msg')

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
    postAnnouncement(context.value, post, post_input.innerHTML, response_msg, name)
})