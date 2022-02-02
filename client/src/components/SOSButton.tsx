import Button from '@mui/material/Button';
// import icon from '/public/lifePreserver.png'

export default function SOSButton(){
    const f = ()=>{
        console.log('clicked');
        // @ts-ignore
        window._chatlio.showOrHide()
    }
    return (
        <Button
            variant="contained"
            className="SOS_Button"
            size="medium"
            onClick={f}
        >
            <img src="/lifePreserver.png" className="SOS_icon" alt="Life Preserver" />
            SOS
        </Button>
    );
}
