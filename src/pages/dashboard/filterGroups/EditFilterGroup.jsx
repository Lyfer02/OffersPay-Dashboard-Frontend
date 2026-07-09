import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Chip,
  Checkbox,
  Select,
  Option,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { categoryService } from "@/api/services/category.service";
import { filterGroupService } from "@/api/services/filterGroup.service";

const EditFilterGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ Get filter group ID from URL params

  const [form, setForm] = useState({
    name: "",
    category: [],
    status: "active",
    options: [],
    optionInput: "",
  });

  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.list();
        if (res.status === 200) {
          setCategories(res.data.data.categories);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch Existing Filter Group
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("this is ");
        
        const res = await filterGroupService.getDetails(id);
        console.log("this is data",res);
        
        const data = res.data.data;

        setForm({
          name: data.name || "",
          category: data.category.map((cat) => cat._id) || [],
          status: data.status || "active",
          options: data.options || [],
          optionInput: "",
        });
      } catch (error) {
        toast.error("Failed to load filter group");
      }
    };
     fetchData();
  }, [id]);

  // ✅ Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleCategory = (catId) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(catId)
        ? prev.category.filter((id) => id !== catId)
        : [...prev.category, catId],
    }));
  };

  const handleAddOption = () => {
    const trimmed = form.optionInput.trim();
    if (trimmed && !form.options.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        options: [...prev.options, trimmed],
        optionInput: "",
      }));
    }
  };

  const handleRemoveOption = (opt) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o !== opt),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      category: form.category,
      status: form.status,
      options: form.options,
    };

    try {
      const res = await filterGroupService.update(id, payload);
      toast.success(res.data.message);
      navigate(-1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const handleClose = () => navigate(-1);

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl ">
      <CardHeader variant="gradient" color="blue" className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="text" onClick={handleClose} className="p-2">
            <ArrowLeft size={24} color="white" />
          </Button>
          <Typography variant="h4" color="white">
            Edit Filter Group
          </Typography>
          <div className="w-6" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody className="grid gap-6 p-6 bg-white">

          {/* ✅ Name and Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Filter Group Name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(val) => handleSelectChange("status", val)}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>

          {/* ✅ Category Multi-Select */}
          <div>
            <Typography variant="small" className="mb-1">
              Select Categories
            </Typography>
            <div
              className="border border-gray-300 rounded-lg p-3 cursor-pointer"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              {form.category.length > 0
                ? form.category
                    .map(
                      (id) =>
                        categories.find((cat) => cat._id === id)?.name ||
                        "Unknown"
                    )
                    .join(", ")
                : "Select Categories"}
            </div>

            {showCategoryDropdown && (
              <div className="border border-gray-200 rounded-lg p-4 mt-2 bg-white max-h-60 overflow-auto z-50">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-3">
                    <Checkbox
                      label={cat.name}
                      checked={form.category.includes(cat._id)}
                      onChange={() => handleToggleCategory(cat._id)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {form.category.map((id) => {
                const category = categories.find((c) => c._id === id);
                return (
                  <Chip
                    key={id}
                    value={category?.name || "Unknown"}
                    onClose={() =>
                      setForm((prev) => ({
                        ...prev,
                        category: prev.category.filter((c) => c !== id),
                      }))
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* ✅ Options */}
          <div>
            <Typography className="mb-2" variant="small">
              Add Options (Example: Apple, Samsung, OnePlus)
            </Typography>
            <div className="flex gap-4">
              <Input
                label="Option"
                name="optionInput"
                value={form.optionInput}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <Button
                color="blue"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddOption();
                }}
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {form.options.map((opt) => (
                <Chip
                  key={opt}
                  value={opt}
                  onClose={() => handleRemoveOption(opt)}
                />
              ))}
            </div>
          </div>

          <Button type="submit" color="blue" size="lg" className="mt-4">
            Update Filter Group
          </Button>
        </CardBody>
      </form>
    </Card>
  );
};

export default EditFilterGroup;
