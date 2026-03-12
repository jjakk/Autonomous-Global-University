import "./HitRateLimitPage.scss";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import ChatAgent from "../classes/ChatAgent";

function HitRateLimitPage() {
    const navigate = useNavigate();

    const updateApiKey = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const newKey = formData.get("apiKey") as string;
        
        // Validate the new API key before saving
        const isValid = await ChatAgent.testKey(newKey);
        console.log("API key validation result:", isValid);
        if (isValid) {
            // AppStorage.updateUserApiKey(newKey);
            navigate("/"); // Redirect to home or previous page
        } else {
            alert("Invalid API key. Please check and try again.");
        }
    };

    const onRefresh = async () => {
        const rateLimitLifted = await ChatAgent.testKey(/*AppStorage.getUser()?.apiKey || */""); // Trigger a test to see if the key is now valid
        if (rateLimitLifted) {
            navigate("/"); // Redirect to home or previous page if rate limit is lifted
        } else {
            alert("Rate limit still in effect. Please wait a moment and try again.");
        }
    };

    return (
        <div>
            <h1>Hit Rate Limit</h1>
            <h2>Set New API Key</h2>
            <p>You have hit the rate limit for API requests. Please wait a moment and try again or update your API key.</p>
            <form className="update-key" onSubmit={updateApiKey}>
                <InputText placeholder="New API Key" />
                <Button label="Update" />
            </form>
            <h2>Check if Rate Limit has Lifted Yet</h2>
            <Button label="Refresh Page" onClick={onRefresh} />
        </div>
    );
}

export default HitRateLimitPage;