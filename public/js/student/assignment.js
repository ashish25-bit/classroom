import { getClassGroups } from '../module/assignment.js'

window.onload = async () => {
    const len = await getClassGroups()
    if (len)
        console.log('classes loaded')
}