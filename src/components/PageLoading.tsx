import { ProgressSpinner } from "primereact/progressspinner";

export function PageLoading() {
    return (
        <div className="flex flex-col items-center gap-4 py-12">
            <ProgressSpinner />
        </div>
    );
}