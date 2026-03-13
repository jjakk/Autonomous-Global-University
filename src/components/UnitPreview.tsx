import { useEffect, useState } from "react";
import { aguDb, type Reading, type Unit } from "../classes/AguDatabase";
import { useNavigate, useParams } from "react-router-dom";
import ChatAgent from "../classes/ChatAgent";

interface UnitPreviewProps {
    unit: Unit;
};

export default function UnitPreview(props: UnitPreviewProps) {
    const navigate = useNavigate();
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async function(){
            setLoading(true);
            let readings: Reading[] | null = await aguDb.readings.where("unitId").equals(props.unit.id).toArray();
            if(!readings?.length) {
                // If no readings exist, create them & throw them in the database
                const apiKey = await aguDb.getUserApiKey();
                const chatAgent = new ChatAgent(apiKey);
                readings = await chatAgent.createReadings(props.unit);
                aguDb.readings.bulkAdd(readings);
            }
            setReadings(readings);
            setLoading(false);
        })();
    }, []);

    return (
        <>
            {props.unit.id}, {props.unit.name}, {props.unit.courseId}
            {/* {unit.readings.map((reading, rIndex, array) => (
                <div key={rIndex}>
                    <h4>Reading {rIndex + 1} - {reading.title}</h4>
                    <h5>{reading.description}</h5>
                    <Button
                        label={"View Reading " + (reading.read ? "(Complete)" : "(Incomplete)")}
                        onClick={() => navigate(`/course/${courseIndex}/unit/${index}/reading/${rIndex}`)}
                        severity="success"
                        outlined={!reading.read}
                        disabled={rIndex > 0 && array[rIndex - 1].read === false}
                    />
                </div>
            ))} */}
        </>
    );
};