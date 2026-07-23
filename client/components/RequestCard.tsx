import { useNavigate } from "react-router-dom";

interface RequestCardProps {
  request: {
    id: number;
    eventName: string;
    date: string;
    sport: string;
    applicationStatus: string;
    personalResult: 'Win' | 'Loss' | '-' | string;
    resultColor: "gray" | "black" | "green" | "red";
  };
}

export default function RequestCard({ request }: RequestCardProps) {
  const navigate = useNavigate();

  const handleRequestClick = (id: number) => {
    navigate(`/requests/${id}`);
  };

  const getResultCircleColor = (color: string) => {
    switch (color) {
      case 'gray': return "bg-[#848484]";
      case 'black': return "bg-black";
      case 'green': return "bg-[#48FF55]";
      case 'red': return "bg-[#FF7B7B]";
      default: return "bg-purple-400";
    }
  };

  const getDisplayResult = (resultCode: string) => {
    switch(resultCode){
      case 'Win': return 'Победа';
      case 'Loss': return 'Поражение';
      case '-': return '';
      default: return resultCode;
    }
  }

  return (
    <div
      className="border-[3px] border-black rounded-[50px] p-6 flex items-center justify-between backdrop-blur-sm relative overflow-hidden"
      style={{
        background: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
        mixBlendMode: "plus-darker",
      }}
    >
      <div
        className="absolute inset-0 -z-10 rounded-[50px]"
        style={{
          backgroundImage: "url('/silver.png')",
          backgroundSize: "250px 250px",
          opacity: 0.05,
        }}
      ></div>

      {/* Left Side - Event Info */}
      <button onClick={() => handleRequestClick(request.id)}
        className="text-left w-full"
      >
        <div className="flex-1 relative z-10">
          <h3 className="text-black text-4xl font-light mb-3">
            {request.eventName}
          </h3>
          <div className="flex items-center gap-3">
            <div className="border-[3px] border-black rounded-[50px] px-5 py-2">
              <span className="text-black text-base font-light">
                {request.date}
              </span>
            </div>
            <div className="border-[3px] border-black rounded-[50px] px-5 py-1.5">
              <span className="text-black text-base font-light">
                {request.sport}
              </span>
            </div>
          </div>
        </div>
        </button>

      {/* Right Side - Status Info */}
      <div className="border-[3px] border-black rounded-[50px] px-8 py-4 min-w-[466px] relative z-10 bg-white/20 backdrop-blur-md">
        <div className="space-y-3">
          {/* Application Status */}
          <div className="flex items-center justify-between">
            <span className="text-black text-2xl font-light">
              Статус заявки
            </span>
            <span className="text-black text-2xl font-light">
              {request.applicationStatus}
            </span>
          </div>
          {/* Game Result */}
          <div className="flex items-center justify-between">
            <span className="text-black text-2xl font-light">
              Результат игры
            </span>
            <div className="flex items-center gap-3">
              <div className={`w-[23px] h-[23px] rounded-full border border-black ${getResultCircleColor(request.resultColor)}`}></div>
              <span className="text-black text-2xl font-light">
                {getDisplayResult(request.personalResult)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}