import { ProgressSpinner } from "primereact/progressspinner";

interface PageLoadingProps {
    message?: string;
};

export function PageLoading(props?: PageLoadingProps) {
    return (
        <div className="flex flex-col items-center gap-8 py-8">
            { props?.message ?? (
                <h2 className="mb-2 text-2xl font-semibold">{props?.message}</h2>
            )}
            <ProgressSpinner />
        </div>
    );
}