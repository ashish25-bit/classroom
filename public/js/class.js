const cid = document.querySelector('#cid')
const students_con = document.querySelector('.students_con')

if(cid) {
    window.onload = () => {
        const id = cid.getAttribute('data-class-id')
        axios.get(`/api/class/students/${id}`)
            .then(res => {
                const { students, error } = res.data
                if(error) 
                    students_con.innerHTML = `<h2>${error}</h2>`
                else {
                    if(students.length) {
                        students_con.innerHTML = ''
                        students.forEach(student => {
                            const { name, regno, section, department, semester } = student
                            const div = document.createElement('div')
                            div.classList.add('student')
                            let content = `<h3>${regno}</h3> <p>${name}</p> <p>${department} - ${section}</p> <p>Semester: ${semester}</p>`
                            div.innerHTML = content
                            students_con.appendChild(div)
                        })
                    }
                    else {
                        students_con.innerHTML = '<h2>No Students</h2>'
                    }
                }
                    
            })
            .catch(err => students_con.innerHTML = '<h2>Server Error</h2>')
    }
}
