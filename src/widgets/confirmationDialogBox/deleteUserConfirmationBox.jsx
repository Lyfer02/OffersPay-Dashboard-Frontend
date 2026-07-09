import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button
  } from "@material-tailwind/react";
  import { X } from "lucide-react";
  import PropTypes from "prop-types";
  
  export const DeleteUserConfirmationDialog=({ 
    open, 
    onClose, 
    onConfirm, 
    item,
    title = "Confirm Delete",
    itemType = "item",
    itemNameField = "id",
    itemDescriptionField = "description",
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel"
  }) =>{
    return (
      <Dialog
        open={open}
        handler={onClose}
        size="md"
      >
        <DialogHeader className="flex items-center justify-between">
          <Typography variant="h5">{title}</Typography>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </DialogHeader>
        <DialogBody className="text-center">
          {item && (
            <>
              <Typography className="mb-4">
                Are you sure you want to delete this {itemType}?
              </Typography>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <Typography variant="h6">{item[itemNameField]}</Typography>
                {itemDescriptionField && item[itemDescriptionField] && (
                  <Typography variant="small" color="blue-gray">
                    {item[itemDescriptionField]}
                  </Typography>
                )}
              </div>
              <Typography color="red" className="font-medium">
                This action cannot be undone.
              </Typography>
            </>
          )}
        </DialogBody>
        <DialogFooter className="flex justify-center gap-2">
          <Button
            variant="outlined"
            color="blue-gray"
            onClick={onClose}
          >
            {cancelButtonText}
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={onConfirm}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }
  
  DeleteUserConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    item: PropTypes.object,
    title: PropTypes.string,
    itemType: PropTypes.string,
    itemNameField: PropTypes.string,
    itemDescriptionField: PropTypes.string,
    confirmButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string
  };
  
  export default DeleteUserConfirmationDialog;