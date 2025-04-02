import { useState } from "react";
import { ChevronDown, ChevronRight, Target, Users, Home } from "lucide-react";

export default function TargetProgressCard() {
    const [selectedTarget, setSelectedTarget] = useState("Overall Target");
    const [progress] = useState(200);
    const target = 10000;
    const staffData = Array(8).fill({ name: "R. Promoth Kumar", progress });
    const branchData = [
        { name: "Geetanjali Lajpat", progress },
        { name: "Geetanjali Malviya", progress },
        { name: "Geetanjali Greater No...", progress },
        { name: "Geetanjali CP", progress },
        { name: "Geetanjali CP", progress },
        { name: "Geetanjali CP", progress },
        { name: "Geetanjali CP", progress },
        { name: "Geetanjali CP", progress },
    ];
    const targetOptions = ["Overall Target", "Branch Target"];
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const getIconForOption = (option) => {
        switch (option) {
            case "Overall Target":
                return <Target size={16} className="mr-2 text-indigo-600" />;
            case "Staff Target":
                return <Users size={16} className="mr-2 text-teal-600" />;
            case "Branch Target":
                return <Home size={16} className="mr-2 text-amber-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-indigo-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-indigo-900">
                    Target Progress
                </h2>
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-800 px-3 py-2 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors"
                    >
                        {getIconForOption(selectedTarget)}
                        {selectedTarget}
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-indigo-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            {targetOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setSelectedTarget(option);
                                        setDropdownOpen(false);
                                    }}
                                    className={`flex items-center w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors ${
                                        selectedTarget === option
                                            ? "bg-indigo-100"
                                            : "text-indigo-800"
                                    }`}
                                >
                                    {getIconForOption(option)}
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-2">
                {selectedTarget === "Overall Target" ? (
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-1">
                            Geetanjali Lajpat's Target
                        </h3>
                        <p className="text-sm text-indigo-700 mb-4">
                            Current progress towards monthly goal
                        </p>
                        <div className="relative pt-1">
                            <div className="flex justify-between text-xs text-indigo-700 mb-1">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                            <div className="w-full h-3 bg-indigo-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            (progress / target) * 100,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold text-indigo-900">
                                    Rs. {progress.toLocaleString()}
                                </p>
                                <p className="text-sm text-indigo-700">
                                    out of Rs. {target.toLocaleString()} target
                                </p>
                            </div>
                            <div className="mt-4 text-sm font-medium text-purple-600">
                                {((progress / target) * 100).toFixed(1)}%
                                completed
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 text-xs text-amber-700 font-medium pb-2 border-b border-amber-100">
                            <div className="col-span-8">Branch</div>
                            <div className="col-span-4 text-right">
                                Progress
                            </div>
                        </div>
                        {branchData.map((branch, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 items-center text-indigo-900 text-sm py-2 hover:bg-amber-50 px-2 rounded transition-colors"
                            >
                                <div className="col-span-8 flex items-center">
                                    <ChevronRight
                                        size={16}
                                        className="text-amber-500 mr-2"
                                    />
                                    {branch.name}
                                </div>
                                <div className="col-span-4 text-right">
                                    <span className="font-medium">
                                        Rs. {branch.progress.toLocaleString()}
                                    </span>
                                    <span className="text-amber-700">
                                        {" "}
                                        / {target.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// : selectedTarget === "Staff Target" ? (
//     <div className="space-y-3">
//         <div className="grid grid-cols-12 text-xs text-teal-700 font-medium pb-2 border-b border-teal-100">
//             <div className="col-span-8">Staff Member</div>
//             <div className="col-span-4 text-right">
//                 Progress
//             </div>
//         </div>
//         {staffData.map((staff, index) => (
//             <div
//                 key={index}
//                 className="grid grid-cols-12 items-center text-indigo-900 text-sm py-2 hover:bg-teal-50 px-2 rounded transition-colors"
//             >
//                 <div className="col-span-8 flex items-center">
//                     <ChevronRight
//                         size={16}
//                         className="text-teal-500 mr-2"
//                     />
//                     {staff.name}
//                 </div>
//                 <div className="col-span-4 text-right">
//                     <span className="font-medium">
//                         Rs. {staff.progress.toLocaleString()}
//                     </span>
//                     <span className="text-teal-700">
//                         {" "}
//                         / {target.toLocaleString()}
//                     </span>
//                 </div>
//             </div>
//         ))}
//     </div>
// )
