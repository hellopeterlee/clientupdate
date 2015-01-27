var addFileTemplate = '<div class="form-group"><div class="col-sm-2"><input type="file" name="file"></div><label class="col-sm-2 control-label" for="inputFilePath">文件路径</label><div class="col-sm-4"><input type="text" class="form-control" name="inputFilePath" placeholder="文件路径" id="inputFilePath"></div><div class="col-sm-1"><button class="btn btn-default btnRemove" type="button">删除</button></div></div>';

var count = 0;
$(function(){
    $('#btnAddFile').click(function(){
        var add = $(addFileTemplate);
        add.find('#inputFilePath').attr('name','inputFilePath'+(++count));
        $('.clearAll').before(add);
    });

    $(document).on('click','.btnRemove',function(){
        $(this).closest('.form-group').remove();
        count--;
    });

    $('#btnUpdate').click(function(){
        $('#editForm').submit();
    });


});