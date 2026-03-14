import { useEffect, useState } from "react";
import { aguDb, type Reading, type Unit } from "../classes/AguDatabase";
import { useNavigate, useParams } from "react-router-dom";
import ChatAgent from "../classes/ChatAgent";
import { useAsyncLoading } from "../hooks";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

interface UnitPreviewProps {
    unit: Unit;
};

export default function UnitPreview(props: UnitPreviewProps) {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [readings, setReadings] = useState<Reading[]>([]);

    const createUnitReadings = async (unit: Unit): Promise<Reading[]> => {
        const apiKey = await aguDb.getUserApiKey();
        const chatAgent = new ChatAgent(apiKey);

        const newReadings: Partial<Reading>[] = await chatAgent.createUnitReadings(props.unit);
        await aguDb.readings.bulkAdd(newReadings as Reading[]);

        return await aguDb.readings.where("unitId").equals(unit.id).toArray();
    }

    const _retreiveReadings = async (unit: Unit): Promise<void> => {
        let readings: Reading[] = await aguDb.readings.where("unitId").equals(unit.id).toArray();

        if(!readings?.length) {
            console.warn("No readings found for unit. Creating readings...");
            readings = await createUnitReadings(unit);
            console.log("Readings created and loaded to database: ", readings);
        }

        setReadings(readings);
    };
    const { loading, wrapped: retreiveReadings } = useAsyncLoading(_retreiveReadings);

    useEffect(() => { retreiveReadings(props.unit) }, []);

    return (
        <>
            {loading ? (
                <ProgressSpinner />
            ) : readings.map((reading, rIndex) => (
                <div key={rIndex}>
                    <h4>Reading {rIndex + 1} - {reading.title}</h4>
                    <h5>{reading.description}</h5>
                    <Button
                        label={"View Reading " + (reading.read ? "(Complete)" : "(Incomplete)")}
                        onClick={() => navigate(`/course/${courseId}/unit/${props.unit.id}/reading/${rIndex}`)}
                        severity="success"
                        // outlined={!reading.read}
                        // disabled={rIndex > 0 && array[rIndex - 1].read === false}
                    />
                </div>
            ))}
        </>
    );
};