import Button from '@mui/material/Button';
// import icon from '/public/lifePreserver.png'

export default function SOSButton(){
    return (
        <Button
            variant="contained"
            className="SOS_Button"
            size="medium"
        >
            <img src="/lifePreserver.png" className="SOS_icon" />
            SOS
        </Button>
    );
}