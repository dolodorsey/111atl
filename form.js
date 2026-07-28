const $=(selector)=>document.querySelector(selector);
const esc=(value='')=>String(value).replace(/[&<>'"]/g,(character)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const fieldLabels={
  full_name:'Full name',email:'Email address',phone:'Phone number',instagram:'Instagram',
  website:'Website',city:'City',state:'State',role_interest:'Role or area of interest',
  message:'Tell us more',organization:'Organization',preferred_date:'Preferred date',
  party_size:'Party size',budget:'Budget',title_entity:'Title / entity',
  signature_name:'Electronic signature'
};
const longFields=new Set(['message','experience']);
const requiredBase=new Set(['full_name','email']);
let events=[];

function routeSlug(){
  const pathMatch=location.pathname.match(/^\/forms\/([^/]+)\/?$/);
  return new URLSearchParams(location.search).get('form')||pathMatch?.[1]||'';
}
function cleanSlug(value){return String(value||'').toLowerCase().replace(/[^a-z0-9-]/g,'')}
function fieldType(name){
  if(name==='email')return'email';
  if(name==='phone')return'tel';
  if(name==='preferred_date')return'date';
  if(name==='party_size')return'number';
  if(name==='website')return'url';
  return'text';
}
function isRequired(name,form){
  if(requiredBase.has(name))return true;
  if(form.form_type==='nda'&&['phone','signature_name'].includes(name))return true;
  if(form.form_type==='host'&&name==='phone')return true;
  if(['rsvp','group_pricing','table_reservation'].includes(form.form_type)&&name==='phone')return true;
  return false;
}
function fieldMarkup(name,form){
  if(name==='event_title')return'';
  if(name==='event_id'){
    const options=events.map((event)=>`<option value="${esc(event.id)}">${esc(event.title)} — ${esc(event.event_date)}</option>`).join('');
    return `<div class="field full"><label for="event_id">Event</label><select id="event_id" name="event_id" required><option value="">Choose an event</option>${options}</select><input type="hidden" name="event_title"></div>`;
  }
  const label=fieldLabels[name]||name.replaceAll('_',' ');
  const required=isRequired(name,form);
  const full=longFields.has(name)||['organization','role_interest','website'].includes(name);
  if(longFields.has(name))return `<div class="field full"><label for="${esc(name)}">${esc(label)}${required?' *':''}</label><textarea id="${esc(name)}" name="${esc(name)}"${required?' required':''}></textarea></div>`;
  return `<div class="field${full?' full':''}"><label for="${esc(name)}">${esc(label)}${required?' *':''}</label><input id="${esc(name)}" name="${esc(name)}" type="${fieldType(name)}"${name==='party_size'?' min="1"':''}${required?' required':''}></div>`;
}
function ndaMarkup(){
  return `<div class="agreement"><p><strong>Agreement acknowledgement</strong></p><p>Read the <a href="/nda.html" target="_blank" rel="noopener">Mutual Confidentiality, Non-Disclosure, Non-Circumvention, Non-Solicitation and Proprietary Rights Agreement</a> before signing.</p>
    <label><input type="checkbox" name="accepted_confidentiality" value="true" required> I accept the confidentiality obligations.</label>
    <label><input type="checkbox" name="accepted_non_compete_non_circumvention" value="true" required> I accept the non-circumvention and non-solicitation terms.</label>
    <label><input type="checkbox" name="accepted_ip_terms" value="true" required> I accept the proprietary-rights terms.</label>
    <label><input type="checkbox" name="accepted_full_agreement" value="true" required> I have reviewed and accept the full agreement.</label></div>`;
}
function renderDirectory(forms){
  $('#loadingStatus').hidden=true;
  $('#formDirectory').hidden=false;
  $('#formDirectory').innerHTML=forms.map((form)=>`<a class="form-link" href="/forms/${esc(form.metadata?.route||form.form_type)}"><small>${esc(form.lane)}</small><b>${esc(form.title)}</b><span>${esc(form.description)}</span></a>`).join('');
}
async function loadEvents(){
  const response=await fetch('/api/events',{headers:{Accept:'application/json'}});
  if(!response.ok)return;
  const data=await response.json();
  events=Array.isArray(data.events)?data.events:[];
}
function bookingType(formType){
  return ({rsvp:'event_rsvp',group_pricing:'private_event',table_reservation:'vip_table'})[formType]||'';
}
function renderForm(form){
  document.title=`${form.title} | 111ATL`;
  $('#pageTitle').textContent=form.title;
  $('#pageDescription').textContent=form.description||'Complete the form below and the request will route to the correct team.';
  $('#loadingStatus').hidden=true;
  $('#formShell').hidden=false;
  let fields=Array.isArray(form.fields)?form.fields:[];
  if(!fields.length)fields=['full_name','email','phone','message'];
  $('#formFields').innerHTML=fields.map((name)=>fieldMarkup(name,form)).join('')+(form.form_type==='nda'?ndaMarkup():'');
  const booking=bookingType(form.form_type);
  $('#publicForm').insertAdjacentHTML('afterbegin',`<input type="hidden" name="form_type" value="${esc(form.form_type)}"><input type="hidden" name="lead_type" value="${esc(form.form_type)}">${booking?`<input type="hidden" name="booking_type" value="${esc(booking)}">`:''}<input type="hidden" name="page" value="${esc(location.pathname)}">`);
  const params=new URLSearchParams(location.search);
  for(const name of ['event_id','event_title','preferred_date']){
    const element=$(`[name="${name}"]`);
    if(element&&params.get(name))element.value=params.get(name);
  }
  const eventSelect=$('[name="event_id"]');
  if(eventSelect)eventSelect.addEventListener('change',()=>{const selected=events.find((event)=>event.id===eventSelect.value);$('[name="event_title"]').value=selected?.title||''});
}
async function submitForm(event){
  event.preventDefault();
  const form=event.currentTarget;
  const responseBox=$('#formResponse');
  if(!form.reportValidity())return;
  const button=form.querySelector('[type="submit"]');
  button.disabled=true;
  responseBox.className='response';
  responseBox.textContent='Submitting…';
  try{
    const payload=Object.fromEntries(new FormData(form).entries());
    payload.submitted_at=new Date().toISOString();
    payload.referrer=document.referrer;
    const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Submission failed');
    form.reset();
    responseBox.className='response success';
    responseBox.textContent='Received. Your request has been sent to the connected 111ATL system.';
  }catch(error){
    responseBox.className='response error';
    responseBox.textContent=error.message||'We could not submit this form. Please try again.';
  }finally{button.disabled=false}
}
async function init(){
  try{
    const slug=cleanSlug(routeSlug());
    const requests=[fetch('/api/forms',{headers:{Accept:'application/json'}})];
    if(slug==='rsvp')requests.push(loadEvents());
    const [response]=await Promise.all(requests);
    if(!response.ok)throw new Error('The form directory is temporarily unavailable.');
    const data=await response.json();
    const forms=Array.isArray(data.forms)?data.forms:[];
    if(!slug)return renderDirectory(forms);
    const form=forms.find((item)=>cleanSlug(item.metadata?.route||item.form_type)===slug);
    if(!form)throw new Error('That form is not available. Choose one of the current forms below.');
    renderForm(form);
  }catch(error){
    $('#loadingStatus').textContent=error.message;
  }
}
$('#publicForm').addEventListener('submit',submitForm);
init();
