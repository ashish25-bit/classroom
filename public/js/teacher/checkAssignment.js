import { sendAssignmentTemplate } from '../module/assignment.js'
const details = document.querySelector('.details')
const stud_detail = document.querySelector('.student_detail')
const ass_detail = document.querySelector('.assignment_detail')

window.onload = async () => {
	const href = window.location.href
    let params = href.split('/');
	params.pop();
    while (params.length != 3 && params.length >= 0) params.shift();

	try {
		const { data: { assignment } } = await axios.get(`/api/faculty/single/assignment/${params[0]}/${params[1]}`);
		const { data } = await axios.get(`/api/get/submission/checking/${params[0]}/${params[1]}/${params[2]}`);

		console.log(data)
		details.innerHTML = sendAssignmentTemplate(assignment, false);
		
		const student = data.student;
		stud_detail.innerHTML = `<h2>${student.name} <span>(${student.regno})</span></h2> 
		<p>${student.department} - ${student.section} <span>(Batch ${student.batch})</span></p>
		<p>Semester: ${student.semester}</p>`

		const Date = moment(data.submitted);
		ass_detail.innerHTML = `<h3>Submitted On: ${Date.format('DD MMMM YYYY hh:mm A')}</h3>`
		const btn = document.createElement('button');
		btn.classList.add('checked')
		if (data.checked) {
			btn.classList.add('true')
			btn.innerText = 'Checked';
		}
		else {
			btn.classList.add('false')
			btn.innerText = 'Not-Checked';

			btn.addEventListener('click', (e) => assignmentCheck(e, data._id));
		}

		ass_detail.appendChild(btn);

	}
	catch (err) {
		console.log(err);	
	}
}

async function assignmentCheck(e, id) {
	e.target.disabled = true;
	try {
		await axios.post('/api/assignment/checked', { id });
		e.target.disabled = false;
		e.target.classList.remove('false')
		e.target.classList.add('true')
		e.target.innerText = 'Checked';
	}
	catch (err) {
		console.log(err.message)
	}
}
