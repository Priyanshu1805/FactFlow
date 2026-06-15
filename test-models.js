const key = "AQ.Ab8RN6Is0xOv4gXIXFt2SiksbQlMoRXg7aVHQVNOB3LnhO_Peg";
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
.then(res => res.json())
.then(data => console.log(data.models.map(m => m.name)))
.catch(console.error);
