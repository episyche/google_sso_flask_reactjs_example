import "./login.css"
import { useRef, useEffect, useState } from "react";

export default function Login(){
const googleButton = useRef(null);
const [reload_google_btn, set_reload_google_btn] = useState(false);


const loadScript = (src) =>
new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.async = 1;
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.body.appendChild(script)
})


function google_sso(){
    let google_sso_public_key = "130916168050-4l7rcjkl30gh92hopg69gmi78s7rqlf1.apps.googleusercontent.com";
    const src = 'https://accounts.google.com/gsi/client'
    const id = google_sso_public_key
    loadScript(src)
    .then(() => {
        /*global google*/
        google.accounts.id.initialize({
            client_id: id,
            select_by: "btn",
            callback: handleCredentialResponse,
        })
        google.accounts.id.renderButton(
            googleButton.current,
            { theme: 'outline', text: 'signin_with',  shape: 'pill', size: "large"}
        )
    })
    .catch(console.error)
    return () => {
        const scriptTag = document.querySelector(`script[src="${src}"]`)
        if (scriptTag) document.body.removeChild(scriptTag)
    }
}


useEffect(() => {
    google_sso()
    setTimeout(()=>{
        set_reload_google_btn(true)
    }, 1000)
}, [reload_google_btn])

function handleCredentialResponse(response) {

    if (response.credential) {
        var data = { "auth_token": response.credential }
        fetch(`http://localhost:5000/api/accounts/google`,
            {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then((res) => res.json())
        .then((res) => {
            processGoogleSSOResponse(res)
        })
    }
}

function processGoogleSSOResponse(res){
    console.log(res)
}

    return(
        <>
        <div >

        </div>
            <div style={{width: "200px", margin: "0px auto"}}>
                <h1 style={{textAlign: "center"}}>Login Page</h1>
                <div ref={googleButton} id='google-ref'></div>
            </div>
        </>
    )
}