import { getAssignmentId, sendAssignmentTemplate } from '../module/assignment.js'
const container = document.querySelector('.single_assignment_con')

window.onload = () => {
    const [ id, name ] = getAssignmentId()
    axios.get(`/api/single/assignment/${name}/${id}`)
        .then(res => {
            if (res.status == 200) 
                container.innerHTML = sendAssignmentTemplate(res.data)
        })
        .catch(err => {
            container.innerHTML = `<h2>${err.response.data}</h2>`
        })
}