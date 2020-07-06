import { getAssignmentId } from '../module/assignment.js'
const container = document.querySelector('.single_assignment_con')
const extensions = ['txt', 'pdf', 'doc', 'docx', 'ppt', 'pptx']
const extImg = ['document.svg', 'pdf.svg', 'word.svg', 'word.svg', 'powerpoint.svg', 'powerpoint.svg']

window.onload = () => {
    const [ id, name ] = getAssignmentId()
    axios.get(`/api/single/assignment/${name}/${id}`)
        .then(res => {
            container.innerHTML = ''
            if (res.status == 200) {
                const { attachments, class: cls, date, fileName, description, title, submissionDate } = res.data
                let content = `<h1 style='font-size:1.7rem;'>
                    <a class='back_link' href='/classroom/${cls.name}'>
                        <i class='fa fa-arrow-left' aria-hidden='true'></i>
                    </a>
                     ${cls.subject}
                </h1>
                <p style='margin-left: 40px;'>${cls.code}</p>
                <hr style='margin: 10px 0; border: 1px soild #555;' />
                <h2>${title}</h2>`
                if (description !== '') 
                    content += `<h4 class='head'>Description</h4> <div class='box'>${description}</div>`
                content +=  `<h4 class='head'>Submission Date</h4> <div class='box'>${submissionDate}</div>`
                if (attachments.length) {
                    content += `<h4 class='head'>Attachments</h4>`
                    let attachmentContent = ''
                    attachments.forEach((pic, index) => {
                        const ext = pic.substring(pic.lastIndexOf('.') + 1, pic.length)
                        attachmentContent += `<div class='docImg'>`
                        if (extensions.includes(ext)) {
                            const index = extensions.indexOf(ext)
                            attachmentContent += `<img src='../public/assets/${extImg[index]}' />`
                        }
                        else 
                            attachmentContent += `<img src='../../assignments/${name}/${pic}' />`
                        attachmentContent += `<p>${fileName[index]}</p>
                            <a href='../../assignments/${name}/${pic}' download='${fileName}' class='download'>
                                <i class='fa fa-arrow-down' aria-hidden="true"></i>
                            </a>
                        </div>`
                    })
                    content += `<div class='box2'>${attachmentContent}</div>`
                }
                container.innerHTML = content
            }
        })
        .catch(err => {
            console.log(err.status)
        })
}