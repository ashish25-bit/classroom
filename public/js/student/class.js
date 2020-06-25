import { displayContainer, getClassUid, getAnnouncements } from '../module/class.js'
const docs_btn = document.querySelector('.docs_btn')
const anounce_btn = document.querySelector('.anouncements_btn')
const document_con = document.querySelector('.document_con')
const announcement_con = document.querySelector('.announcement_con')
const announcements = document.querySelector('.announcements')

docs_btn.addEventListener('click', () => {
    if (!docs_btn.classList.contains('active')) {
        displayContainer(docs_btn, anounce_btn, document_con, announcement_con)
    }
})

anounce_btn.addEventListener('click', () => {
    if (!anounce_btn.classList.contains('active')) {
        displayContainer(anounce_btn, docs_btn, announcement_con, document_con)
        const name = getClassUid()
        announcements.innerHTML = '<h2>Loading...</h2>'
        getAnnouncements(name, announcements)
    }
})