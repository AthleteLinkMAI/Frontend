import { motion } from "framer-motion";
import SidebarNav from "@/components/SidebarMenu";
import HeaderMenu from "@/components/HeaderMenu";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import { getTimeGreeting } from "@/components/TimeParse";

export default function Authors() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
      <div className="flex min-h-screen">
        <SidebarNav activePage="authors" />

        <div className="flex-1 p-7 overflow-y-auto">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user?.full_name ?? "Гость"}`}
            date={getCurrentDateFormatted()}
          />

          <div className="rounded-[10px] bg-white/50 p-8 relative min-h-[850px]">
            <h2 className="text-black text-[46px] font-medium mb-10">Авторы проекта</h2>

            <div className="grid grid-cols-5 gap-6 mt-6">

              {/* 1 */}
              <motion.div
                className="flex flex-col items-center"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/111.jpg" className="w-[150px] h-[150px] object-contain drop-shadow-xl" />
                <p className="text-white text-center mt-3 text-lg">Евграфов Илья, TeamLead</p>
              </motion.div>

              {/* 2 */}
              <motion.div
                className="flex flex-col items-center"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/222.jpg" className="w-[150px] h-[150px] object-contain drop-shadow-xl" />
                <p className="text-white text-center mt-3 text-lg">Уханов Федор, Frontend</p>
              </motion.div>

              {/* 3 */}
              <motion.div
                className="flex flex-col items-center"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/333.jpg" className="w-[150px] h-[150px] object-contain drop-shadow-xl" />
                <p className="text-white text-center mt-3 text-lg">Белкин Сергей, Backend</p>
              </motion.div>

              {/* 4 */}
              <motion.div
                className="flex flex-col items-center"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/444.jpg" className="w-[150px] h-[150px] object-contain drop-shadow-xl" />
                <p className="text-white text-center mt-3 text-lg">Смирнов Вячеслав, Backend</p>
              </motion.div>

              {/* 5 */}
              <motion.div
                className="flex flex-col items-center"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/555.jpg" className="w-[150px] h-[150px] object-contain drop-shadow-xl" />
                <p className="text-white text-center mt-3 text-lg">Крылов Даниил, Frontend</p>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
