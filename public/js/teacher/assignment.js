import { getClassGroups } from '../module/assignment.js'
import { displayContainer } from '../module/class.js'
const assign_btn = document.querySelector('.assign_btn')
const assigned_btn = document.querySelector('.assigned_btn')
const assign_container = document.querySelector('.assign_container')
const assignment_container = document.querySelector('.assignment_container')

window.onload = async () => {
    const len = await getClassGroups()
}

assign_btn.addEventListener('click', e => {
    if (!assign_btn.classList.contains('active')) 
        displayContainer(assign_btn, assigned_btn, assign_container, assignment_container)
})

assigned_btn.addEventListener('click', e => {
    if (!assigned_btn.classList.contains('active')) 
        displayContainer(assigned_btn, assign_btn, assignment_container, assign_container)
})
