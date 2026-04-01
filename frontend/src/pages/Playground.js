import Button from "../components/Button";

export default function Playground() {
  return (
    <div>
      <div className="w-full h-full flex flex-col items-center p-[2rem]">
        Playground
        <Button body="hello" />
      </div>
    </div>
  );
}
