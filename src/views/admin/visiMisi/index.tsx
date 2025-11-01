import Card from "components/card";
import React, { useEffect, useState } from "react";
import { MdEdit, MdLocationOn, MdSave } from "react-icons/md";

type Profile = {
  deskripsi: string;
  letakGeografis: string;
  visi: string;
  misi: string;
};

const VisiMisiPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    deskripsi: "",
    letakGeografis: "",
    visi: "",
    misi: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("profileRW");
    if (saved && JSON.parse(saved).length > 0) {
      setProfile(JSON.parse(saved));
    } else {
      const dummyProfile: Profile = {
        deskripsi: "RW 001 adalah salah satu rukun warga di Kelurahan Cempaka Putih, Jakarta Pusat. Kami memiliki 450 KK dengan total 1.800 jiwa. RW ini dikenal dengan kebersamaan dan gotong royong antar warga.",
        letakGeografis: "Terletak di Jl. Percetakan Negara, berbatasan dengan RW 002 di sebelah timur, Jl. Letjen Suprapto di utara, dan Sungai Ciliwung di selatan.",
        visi: "Menjadi RW yang maju, bersih, aman, dan sejahtera dengan partisipasi aktif seluruh warga.",
        misi: "1. Meningkatkan kebersihan dan keindahan lingkungan\n2. Mengembangkan program kesehatan dan pendidikan\n3. Mempererat silaturahmi antar warga\n4. Memberdayakan potensi ekonomi lokal",
      };
      setProfile(dummyProfile);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("profileRW", JSON.stringify(profile));
  }, [profile]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setIsEditing(false);
      setLoading(false);
      alert("Profile berhasil disimpan!");
    }, 1000);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div>
      <div className="mt-3">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdLocationOn className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Profile RW</h3>
        </div>

        <Card extra="w-full p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={profile.deskripsi}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full rounded-lg border px-3 py-2 ${
                  isEditing
                    ? "border-gray-300 bg-white dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    : "border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
                }`}
                placeholder="Masukkan deskripsi RW..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Letak Geografis</label>
              <textarea
                name="letakGeografis"
                value={profile.letakGeografis}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 ${
                  isEditing
                    ? "border-gray-300 bg-white dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    : "border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
                }`}
                placeholder="Masukkan letak geografis RW..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Visi</label>
              <textarea
                name="visi"
                value={profile.visi}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 ${
                  isEditing
                    ? "border-gray-300 bg-white dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    : "border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
                }`}
                placeholder="Masukkan visi RW..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Misi</label>
              <textarea
                name="misi"
                value={profile.misi}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full rounded-lg border px-3 py-2 ${
                  isEditing
                    ? "border-gray-300 bg-white dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    : "border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
                }`}
                placeholder="Masukkan misi RW..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-navy-600">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <MdSave className="h-5 w-5" />
                        Simpan
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
                >
                  <MdEdit className="h-5 w-5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisiMisiPage;