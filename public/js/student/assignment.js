import { getClassGroups, getAssignments } from '../module/assignment.js'
import { getClassUid } from '../module/class.js'

window.onload = async () => {
    const name = getClassUid()
    document.querySelector('.assignment_container').style.display = 'block'
    document.querySelector('.assignment_container').innerHTML = '<h3>Loading...</h3>'
    const len = await getClassGroups()
    getAssignments(name)
}