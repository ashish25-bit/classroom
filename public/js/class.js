import {  getClassUid, getDocuments } from './module/class.js'
const students_con = document.querySelector('.member_list')

window.onload = () => {
    let id = getClassUid()
    axios.get(`/api/class/students/${id}`)
        .then(res => {
            const { students, error } = res.data
            if (error)
                students_con.innerHTML = `<h2>${error}</h2>`
            else {
                if (students.length) {
                    students_con.innerHTML = ''
                    students.forEach(student => {
                        const { name, regno } = student
                        const div = document.createElement('div')
                        div.classList.add('member')
                        let content = `<p>${regno}</p> <p>${name}</p>`
                        div.innerHTML = content
                        students_con.appendChild(div)
                    })
                }
                else {
                    students_con.innerHTML = `<h2 style='padding: 10px 20px;'>No Students</h2>`
                }
            }
        })
        .catch(err => {
            console.log(err)
            students_con.innerHTML = `<h2 style='padding: 10px 20px;'>Server Error</h2>`
        })
        
    // getAnnouncements(id)
    getDocuments(id)
}