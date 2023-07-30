import { toast } from "@/components/ui/use-toast";

interface Props {
    emailAddr: string;
}

export function PermDenied(props: Props) {
    return (
        <div className="w-full flex-1 flex flex-col items-center py-12">
            <h1 className="text-7xl">Permission Denied</h1>
            <p className="mt-5 text-xl text-center">
                You do not have permission to access this page.
                <br />
                Your email address {props.emailAddr} is not an eanes email address.
                <br />
                Please sign up with an eanes Email address.
            </p>
        </div>
    );
}
