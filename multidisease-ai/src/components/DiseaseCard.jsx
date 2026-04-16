import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function DiseaseCard({ icon, title, desc, link }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition duration-300"
    >
      <div className="text-4xl text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{desc}</p>
      <Link to={link} className="text-blue-600 font-medium hover:underline">
        Explore →
      </Link>
    </motion.div>
  );
}
