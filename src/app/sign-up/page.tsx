import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen">
      {/* Al poner routing="hash", ya no necesita la carpeta extraña [[...]] */}
      <SignUp routing="hash" />
    </div>
  );
}